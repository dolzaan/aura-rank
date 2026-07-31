import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { usernameSchema } from "@/lib/usernames";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  username: usernameSchema,
  bio: z.string().trim().max(160),
  image: z.url().nullable().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre para continuar." }, { status: 401 });
  }
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 },
    );
  }
  if (
    parsed.data.image &&
    !new URL(parsed.data.image).hostname.endsWith(".blob.vercel-storage.com")
  ) {
    return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });
  }
  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { username: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Esse username já tem dono." },
        { status: 409 },
      );
    }
    throw error;
  }
}
