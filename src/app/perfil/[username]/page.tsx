import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Grid3X3,
  Play,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BrandMark } from "@/components/brand";
import { FollowButton } from "@/components/follow-button";

export default async function Perfil({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await auth();
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      submissions: {
        where: { status: "APPROVED" },
        include: { _count: { select: { likes: true, comments: true } } },
        orderBy: { createdAt: "desc" },
      },
      followers: {
        where: { followerId: session!.user.id },
        select: { followerId: true },
      },
      _count: {
        select: {
          submissions: { where: { status: "APPROVED" } },
          followers: true,
          following: true,
        },
      },
    },
  });
  if (!user?.username) notFound();
  const isOwn = session?.user?.id === user.id;

  return (
    <main className="space-y-8 pb-28 pt-6 sm:pb-12 sm:pt-10">
      <section className="surface relative overflow-hidden p-6 sm:p-9">
        <div className="aura-rings absolute -right-32 -top-40 h-[28rem] w-[28rem] opacity-50" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center">
          <div className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-full border border-aura/40 bg-zinc-950 text-3xl font-black">
            {user.image ? (
              <Image
                src={`/api/avatar/${encodeURIComponent(user.username)}`}
                alt={`Foto de ${user.name || user.username}`}
                fill
                priority
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            ) : (
              (user.name || user.username)
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            )}
            <span className="absolute bottom-0 right-0 z-10 grid size-8 place-items-center rounded-full bg-aura text-black ring-4 ring-[#090909]">
              <BrandMark className="size-4" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {user.name || user.username}
              </h1>
              {user.isDemo ? <span className="section-label">Demonstração</span> : null}
            </div>
            <p className="mt-1 text-zinc-500">@{user.username}</p>
            <p className="mt-4 max-w-xl whitespace-pre-line text-zinc-300">
              {user.bio || "Este perfil ainda não adicionou uma biografia."}
            </p>
          </div>

          <div className="flex gap-3">
            {isOwn ? (
              <Link
                href="/configuracoes/perfil"
                className="secondary-button flex min-h-11 items-center gap-2 px-4"
              >
                <Settings size={18} /> Editar perfil
              </Link>
            ) : (
              <FollowButton
                username={user.username}
                initialFollowing={user.followers.length > 0}
                initialFollowerCount={user._count.followers}
              />
            )}
          </div>
        </div>

        <div className="relative mt-9 grid grid-cols-3 gap-3 border-t border-white/10 pt-7 sm:max-w-xl">
          {[
            [user._count.submissions, "posts"],
            [user._count.followers, "seguidores"],
            [user._count.following, "seguindo"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-xl font-bold">{Number(value).toLocaleString("pt-BR")}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Aura acumulada</p>
            <p className="mt-3 text-4xl font-black text-aura sm:text-5xl">
              {user.auraBalance.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="grid size-11 place-items-center rounded-full border border-aura/30 bg-aura/10 text-aura">
            <Sparkles size={20} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Conteúdo</p>
            <h2 className="mt-2 text-2xl font-bold">Farms publicados</h2>
          </div>
          <Link href="/feed" className="flex items-center gap-2 text-sm font-semibold text-aura">
            Ver feed <ArrowUpRight size={16} />
          </Link>
        </div>

        {user.submissions.length ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
            {user.submissions.map((post) => {
              const src = post.videoUrl.includes(".private.blob.vercel-storage.com")
                ? `/api/videos/${post.id}/media`
                : post.videoUrl;
              return (
                <Link
                  href={`/feed#video-${post.id}`}
                  key={post.id}
                  className="surface group relative aspect-[3/4] overflow-hidden"
                >
                  <video
                    src={src}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-aura">
                    +{post.totalPoints || 0}
                  </span>
                  <Play
                    size={28}
                    fill="white"
                    className="absolute inset-0 m-auto text-white drop-shadow-lg"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="line-clamp-2 text-xs font-semibold">{post.caption}</p>
                    <div className="mt-2 flex gap-3 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Grid3X3 size={11} /> {post._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {post._count.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="surface py-14 text-center text-sm text-zinc-500">
            Nenhum vídeo publicado ainda.
          </div>
        )}
      </section>
    </main>
  );
}
