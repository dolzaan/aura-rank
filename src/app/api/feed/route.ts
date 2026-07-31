import { NextResponse } from "next/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VIDEO_URL_LIFETIME = 60 * 60 * 1000;
const FEED_PAGE_SIZE = 8;

function parseCursor(value: string | null) {
  const cursor = Number.parseInt(value || "0", 10);
  return Number.isFinite(cursor) && cursor > 0 ? cursor : 0;
}

function diversifyAuthors<T extends { userId: string }>(videos: T[]) {
  const pending = [...videos];
  const diversified: T[] = [];

  while (pending.length > 0) {
    const previousAuthor = diversified.at(-1)?.userId;
    const differentAuthorIndex = previousAuthor
      ? pending.findIndex((video) => video.userId !== previousAuthor)
      : 0;
    const nextIndex = differentAuthorIndex >= 0 ? differentAuthorIndex : 0;
    diversified.push(pending.splice(nextIndex, 1)[0]);
  }

  return diversified;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre para ver o feed." }, { status: 401 });
  }
  const currentUserId = session.user.id;
  const searchParams = new URL(request.url).searchParams;
  const followingOnly = searchParams.get("mode") === "following";
  const cursor = parseCursor(searchParams.get("cursor"));
  const seed = (searchParams.get("seed") || crypto.randomUUID()).slice(0, 80);

  const followingFilter = followingOnly
    ? Prisma.sql`
        AND EXISTS (
          SELECT 1
          FROM "Follow" AS follow
          WHERE follow."followingId" = video."userId"
            AND follow."followerId" = ${currentUserId}
        )
      `
    : Prisma.empty;

  // A seed keeps pagination stable while producing a different order for each
  // feed session. Ordering IDs in SQL avoids loading the whole catalog at once.
  const rankedVideoIds = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT video."id"
      FROM "VideoSubmission" AS video
      INNER JOIN "User" AS author ON author."id" = video."userId"
      WHERE video."status" = 'APPROVED'
        AND video."videoUrl" LIKE 'https://%'
        AND author."username" IS NOT NULL
        ${followingFilter}
      ORDER BY (
        -- Discovery remains the dominant signal, so every session feels new.
        (
          ('x' || substr(
            md5(CAST(${seed} AS TEXT) || ':' || video."id"),
            1,
            8
          ))::bit(32)::bigint / 4294967295.0
        ) * 0.70
        + CASE WHEN EXISTS (
          SELECT 1 FROM "Follow" AS affinity_follow
          WHERE affinity_follow."followingId" = video."userId"
            AND affinity_follow."followerId" = ${currentUserId}
        ) THEN 0.10 ELSE 0 END
        + CASE WHEN EXISTS (
          SELECT 1
          FROM "VideoLike" AS affinity_like
          INNER JOIN "VideoSubmission" AS liked_video
            ON liked_video."id" = affinity_like."videoId"
          WHERE affinity_like."userId" = ${currentUserId}
            AND liked_video."userId" = video."userId"
        ) THEN 0.07 ELSE 0 END
        + LEAST(
          0.08,
          LN(
            1
            + (SELECT COUNT(*) FROM "VideoLike" AS popularity_like
               WHERE popularity_like."videoId" = video."id") * 2
            + (SELECT COUNT(*) FROM "Comment" AS popularity_comment
               WHERE popularity_comment."videoId" = video."id")
            + (SELECT COUNT(*) FROM "ShareEvent" AS popularity_share
               WHERE popularity_share."videoId" = video."id") * 3
          ) / 30.0
        )
        + GREATEST(
          0.0,
          0.07 - EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - video."createdAt"))
            / 86400.0 * 0.002
        )
        - CASE WHEN EXISTS (
          SELECT 1 FROM "VideoLike" AS consumed_like
          WHERE consumed_like."videoId" = video."id"
            AND consumed_like."userId" = ${currentUserId}
        ) OR EXISTS (
          SELECT 1 FROM "SavedVideo" AS consumed_save
          WHERE consumed_save."videoId" = video."id"
            AND consumed_save."userId" = ${currentUserId}
        ) THEN 0.14 ELSE 0 END
        - CASE WHEN video."userId" = ${currentUserId}
          THEN 0.08 ELSE 0 END
      ) DESC,
      md5(video."id" || ':' || CAST(${seed} AS TEXT))
      OFFSET ${cursor}
      LIMIT ${FEED_PAGE_SIZE + 1}
    `,
  );

  const hasMore = rankedVideoIds.length > FEED_PAGE_SIZE;
  const pageIds = rankedVideoIds
    .slice(0, FEED_PAGE_SIZE)
    .map((video) => video.id);

  const unorderedVideos = await prisma.videoSubmission.findMany({
    where: {
      id: { in: pageIds },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          auraBalance: true,
          isDemo: true,
          followers: {
            where: { followerId: currentUserId },
            select: { followerId: true },
            take: 1,
          },
        },
      },
      likes: {
        where: { userId: currentUserId },
        select: { userId: true },
        take: 1,
      },
      savedBy: {
        where: { userId: currentUserId },
        select: { userId: true },
        take: 1,
      },
      _count: {
        select: {
          comments: true,
          likes: true,
          savedBy: true,
          shares: true,
        },
      },
    },
  });

  const videosById = new Map(
    unorderedVideos.map((video) => [video.id, video]),
  );
  const videos = diversifyAuthors(
    pageIds.flatMap((id) => {
      const video = videosById.get(id);
      return video ? [video] : [];
    }),
  );

  const hasPrivateVideos = videos.some((video) =>
    video.videoUrl.includes(".private.blob.vercel-storage.com"),
  );
  const validUntil = Date.now() + VIDEO_URL_LIFETIME;
  let signedToken: Awaited<ReturnType<typeof issueSignedToken>> | null = null;
  if (hasPrivateVideos && process.env.BLOB_STORE_ID) {
    try {
      signedToken = await issueSignedToken({
        storeId: process.env.BLOB_STORE_ID,
        pathname: "*",
        operations: ["get"],
        validUntil,
      });
    } catch (error) {
      console.error("[api/feed] Falha ao assinar URLs dos vídeos:", error);
    }
  }

  return NextResponse.json({
    seed,
    nextCursor: hasMore ? String(cursor + pageIds.length) : null,
    posts: await Promise.all(videos.map(async (video) => {
      const analysis =
        video.analysis && typeof video.analysis === "object"
          ? (video.analysis as Record<string, unknown>)
          : {};
      const displayName = video.user.name || "Pessoa Aura";
      let playableVideoUrl = video.videoUrl;
      if (
        signedToken &&
        video.videoUrl.includes(".private.blob.vercel-storage.com")
      ) {
        try {
          const pathname = decodeURIComponent(
            new URL(video.videoUrl).pathname.slice(1),
          );
          const signed = await presignUrl(signedToken, {
            operation: "get",
            pathname,
            access: "private",
            validUntil,
          });
          playableVideoUrl = signed.presignedUrl;
        } catch (error) {
          console.error("[api/feed] Falha ao assinar vídeo:", {
            videoId: video.id,
            error,
          });
          playableVideoUrl = `/api/videos/${video.id}/media`;
        }
      } else if (video.videoUrl.includes(".private.blob.vercel-storage.com")) {
        playableVideoUrl = `/api/videos/${video.id}/media`;
      }
      return {
        id: video.id,
        videoUrl: playableVideoUrl,
        fallbackVideoUrl: `/api/videos/${video.id}/media`,
        caption: video.caption || "Um novo momento de aura.",
        points: video.totalPoints || 0,
        aiSummary:
          typeof analysis.publicCaption === "string"
            ? analysis.publicCaption
            : typeof analysis.summary === "string"
              ? analysis.summary
              : "Analisado pelo Gemini.",
        tags: [
          `Presença +${Number(analysis.presence || 0)}`,
          `Execução +${Number(analysis.execution || 0)}`,
          `Originalidade +${Number(analysis.originality || 0)}`,
          `Impacto +${Number(analysis.impact || 0)}`,
        ],
        commentCount: video._count.comments,
        likeCount: video._count.likes,
        saveCount: video._count.savedBy,
        shareCount: video._count.shares,
        isLiked: video.likes.length > 0,
        isSaved: video.savedBy.length > 0,
        isFollowing: video.user.followers.length > 0,
        isOwn: video.user.id === currentUserId,
        sourceUrl: video.sourceUrl,
        sourceName: video.sourceName,
        user: {
          username: video.user.username!,
          name: displayName,
          image: video.user.image,
          isDemo: video.user.isDemo,
          aura: video.user.auraBalance,
          trend: `+${video.totalPoints || 0}`,
          avatar: displayName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        },
      };
    })),
  }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
