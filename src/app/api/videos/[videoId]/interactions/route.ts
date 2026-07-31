import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const interactionSchema = z.object({
  action: z.enum(["like", "save", "share"]),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ videoId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre para interagir." }, { status: 401 });
  }
  const parsed = interactionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
  const { videoId } = await context.params;
  const video = await prisma.videoSubmission.findUnique({
    where: { id: videoId },
    select: { id: true },
  });
  if (!video) {
    return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
  }

  const key = { userId_videoId: { userId: session.user.id, videoId } };
  let active = true;
  if (parsed.data.action === "like") {
    const current = await prisma.videoLike.findUnique({ where: key });
    if (current) {
      await prisma.videoLike.delete({ where: key });
      active = false;
    } else {
      await prisma.videoLike.create({
        data: { userId: session.user.id, videoId },
      });
    }
  } else if (parsed.data.action === "save") {
    const current = await prisma.savedVideo.findUnique({ where: key });
    if (current) {
      await prisma.savedVideo.delete({ where: key });
      active = false;
    } else {
      await prisma.savedVideo.create({
        data: { userId: session.user.id, videoId },
      });
    }
  } else {
    await prisma.shareEvent.create({
      data: { userId: session.user.id, videoId },
    });
  }

  const [likeCount, saveCount, shareCount] = await Promise.all([
    prisma.videoLike.count({ where: { videoId } }),
    prisma.savedVideo.count({ where: { videoId } }),
    prisma.shareEvent.count({ where: { videoId } }),
  ]);
  return NextResponse.json({ active, likeCount, saveCount, shareCount });
}
