import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const EMPTY_RESULTS = { profiles: [], videos: [] };

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre para pesquisar." }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80);
  if (!query || query.length < 2) {
    return NextResponse.json(EMPTY_RESULTS, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const [profiles, videos] = await Promise.all([
    prisma.user.findMany({
      where: {
        username: { not: null },
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        auraBalance: true,
        _count: { select: { followers: true } },
      },
      orderBy: [{ auraBalance: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.videoSubmission.findMany({
      where: {
        status: "APPROVED",
        videoUrl: { startsWith: "https://" },
        user: { username: { not: null } },
        OR: [
          { caption: { contains: query, mode: "insensitive" } },
          { sourceName: { contains: query, mode: "insensitive" } },
          { user: { username: { contains: query, mode: "insensitive" } } },
          { user: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        caption: true,
        totalPoints: true,
        createdAt: true,
        user: { select: { username: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return NextResponse.json(
    {
      profiles: profiles.map((profile) => ({
        id: profile.id,
        username: profile.username!,
        name: profile.name || profile.username!,
        bio: profile.bio,
        hasImage: Boolean(profile.image),
        aura: profile.auraBalance,
        followerCount: profile._count.followers,
      })),
      videos: videos.map((video) => ({
        id: video.id,
        caption: video.caption || "Um novo momento de aura.",
        points: video.totalPoints || 0,
        mediaUrl: `/api/videos/${video.id}/media`,
        likeCount: video._count.likes,
        commentCount: video._count.comments,
        user: {
          username: video.user.username!,
          name: video.user.name || video.user.username!,
          hasImage: Boolean(video.user.image),
        },
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
