import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json({
    posts: videos.map((video) => {
      const analysis =
        video.analysis && typeof video.analysis === "object"
          ? (video.analysis as Record<string, unknown>)
          : {};
      const displayName = video.user.name || "Pessoa Aura";
      return {
        id: video.id,
        videoUrl: video.videoUrl.includes(".private.blob.vercel-storage.com")
          ? `/api/videos/${video.id}/media`
          : video.videoUrl,
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
    }),
  });
}
