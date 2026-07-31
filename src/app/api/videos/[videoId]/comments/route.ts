import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  body: z.string().trim().min(1).max(500),
  parentId: z.string().min(1).optional(),
});

function serialize(comment: {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: Date;
  user: { name: string | null; username: string | null; image: string | null };
}) {
  return {
    id: comment.id,
    body: comment.body,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    user: {
      name: comment.user.name || "Pessoa Aura",
      username: comment.user.username || "auratok",
      image: comment.user.image,
    },
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ videoId: string }> },
) {
  const { videoId } = await context.params;
  const video = await prisma.videoSubmission.findUnique({
    where: { id: videoId },
    select: { id: true },
  });
  if (!video) {
    return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { videoId },
    include: { user: { select: { name: true, username: true, image: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json({
    comments: comments.map(serialize),
    count: comments.length,
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ videoId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre para comentar." }, { status: 401 });
  }
  const { videoId } = await context.params;
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Comentário inválido." },
      { status: 400 },
    );
  }

  const video = await prisma.videoSubmission.findUnique({
    where: { id: videoId },
    select: { id: true },
  });
  if (!video) {
    return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
  }

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parsed.data.parentId, videoId },
      select: { id: true },
    });
    if (!parent) {
      return NextResponse.json(
        { error: "O comentário respondido não existe." },
        { status: 400 },
      );
    }
  }

  const comment = await prisma.comment.create({
    data: {
      videoId,
      userId: session.user.id,
      parentId: parsed.data.parentId,
      body: parsed.data.body,
    },
    include: { user: { select: { name: true, username: true, image: true } } },
  });

  return NextResponse.json({ comment: serialize(comment) }, { status: 201 });
}
