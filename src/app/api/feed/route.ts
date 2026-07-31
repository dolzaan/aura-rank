import { NextResponse } from "next/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VIDEO_URL_LIFETIME = 60 * 60 * 1000;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre para ver o feed." }, { status: 401 });
  }
  const currentUserId = session.user.id;
  const followingOnly =
    new URL(request.url).searchParams.get("mode") === "following";

  const videos = await prisma.videoSubmission.findMany({
    where: {
      status: "APPROVED",
      videoUrl: { startsWith: "https://" },
      user: {
        username: { not: null },
        ...(followingOnly
          ? { followers: { some: { followerId: currentUserId } } }
          : {}),
      },
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
    orderBy: { createdAt: "desc" },
    take: 30,
  });

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
  });
}
