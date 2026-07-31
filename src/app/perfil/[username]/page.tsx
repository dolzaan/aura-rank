import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Grid3X3,
  MapPin,
  Play,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { posts, users } from "@/lib/mock";

export default async function Perfil({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = users.find((candidate) => candidate.username === username) ?? users[2];

  return (
    <main className="space-y-8 pb-28 pt-6 sm:pb-12 sm:pt-10">
      <section className="surface relative overflow-hidden p-6 sm:p-9">
        <div className="aura-rings absolute -right-32 -top-40 h-[28rem] w-[28rem] opacity-50" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center">
          <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full border border-aura/40 bg-zinc-950 text-3xl font-black">
            {user.avatar}
            <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-aura text-black ring-4 ring-[#090909]">
              <BrandMark className="h-4 w-4" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {user.name}
              </h1>
              <span className="section-label">Nível 12</span>
            </div>
            <p className="mt-1 text-zinc-500">@{user.username}</p>
            <p className="mt-4 max-w-xl text-zinc-300">
              Transformando momentos comuns em presença. Um vídeo, uma história
              e muita aura por vez.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
              <MapPin size={15} /> São Paulo, Brasil
            </p>
          </div>

          <div className="flex gap-3">
            <button className="primary-button flex-1 sm:flex-none">
              Seguir
            </button>
            <button className="icon-button" aria-label="Configurações">
              <Settings size={19} />
            </button>
          </div>
        </div>

        <div className="relative mt-9 grid grid-cols-3 gap-3 border-t border-white/10 pt-7 sm:max-w-xl">
          {[
            ["128", "posts"],
            ["18,6K", "seguidores"],
            ["342", "seguindo"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface p-6 md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Aura acumulada</p>
              <p className="mt-3 text-4xl font-black text-aura sm:text-5xl">
                {user.aura.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full border border-aura/30 bg-aura/10 text-aura">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between text-sm">
            <span className="text-zinc-500">Progresso para o nível 13</span>
            <span className="font-semibold text-aura">78%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900">
            <div className="h-full w-[78%] rounded-full bg-aura" />
          </div>
        </article>

        <article className="surface flex flex-col justify-between p-6">
          <Award className="text-aura" size={24} />
          <div className="mt-8">
            <p className="text-3xl font-black">Top 4%</p>
            <p className="mt-1 text-sm text-zinc-500">no ranking global</p>
          </div>
        </article>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Conteúdo</p>
            <h2 className="mt-2 text-2xl font-bold">Melhores farms</h2>
          </div>
          <Link
            href="/feed"
            className="flex items-center gap-2 text-sm font-semibold text-aura"
          >
            Ver feed <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...posts, posts[0]].map((post, index) => (
            <article
              key={`${post.user.username}-${index}`}
              className="surface group relative aspect-[4/5] overflow-hidden"
            >
              <Image
                src="/auratok-skate-hero.png"
                alt="Skatista em movimento na cidade"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <TrendingUp size={13} className="text-aura" />
                +{post.points} aura
              </div>
              <button
                className="absolute inset-0 m-auto grid h-12 w-12 place-items-center self-center rounded-full bg-aura text-black opacity-0 transition group-hover:opacity-100"
                aria-label="Reproduzir vídeo"
              >
                <Play size={20} fill="currentColor" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="line-clamp-2 text-sm font-medium">{post.caption}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Grid3X3 size={13} /> {42 + index * 19}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} /> {128 + index * 54}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
