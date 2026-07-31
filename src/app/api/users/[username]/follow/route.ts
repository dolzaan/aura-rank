import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre para seguir." }, { status: 401 });
  }
  const { username } = await context.params;
  const target = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }
  if (target.id === session.user.id) {
    return NextResponse.json(
      { error: "Você não pode seguir o próprio perfil." },
      { status: 400 },
    );
  }
  const where = {
    followerId_followingId: {
      followerId: session.user.id,
      followingId: target.id,
    },
  };
  const current = await prisma.follow.findUnique({ where });
  let following = true;
  if (current) {
    await prisma.follow.delete({ where });
    following = false;
  } else {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: target.id },
    });
  }
  const followerCount = await prisma.follow.count({
    where: { followingId: target.id },
  });
  return NextResponse.json({ following, followerCount });
}
