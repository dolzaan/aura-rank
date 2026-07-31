import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const videos = await prisma.videoSubmission.findMany({
    where: {
      status: "APPROVED",
      videoUrl: { startsWith: "https://" },
    },
    include: {
      user: {
        select: {
          username: true,
          name: true,
          auraBalance: true,
        },
      },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    posts: videos.map((video) => {
      const analysis =
        video.analysis && typeof video.analysis === "object"
          ? (video.analysis as Record<string, unknown>)
          : {};
      return {
        id: video.id,
        videoUrl: video.videoUrl,
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
        user: {
          username: video.user.username || "auratok",
          name: video.user.name || "Pessoa Aura",
          aura: video.user.auraBalance,
          trend: `+${video.totalPoints || 0}`,
          avatar: (video.user.name || "AT")
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
