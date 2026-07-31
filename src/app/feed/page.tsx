"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Music2,
  Plus,
  Send,
  Volume2,
} from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/brand";
import { posts } from "@/lib/mock";

const actionClass =
  "flex flex-col items-center gap-1 border-0 bg-transparent text-white drop-shadow-lg transition active:scale-90";

export default function Feed() {
  return (
    <section className="feed-shell mx-auto h-dvh w-full max-w-[520px] overflow-hidden bg-black md:mt-16 md:h-[calc(100dvh-4rem)] md:rounded-t-[28px] md:border-x md:border-t md:border-white/10">
      <header className="pointer-events-none fixed left-1/2 top-0 z-40 flex h-[70px] w-full max-w-[520px] -translate-x-1/2 items-center justify-between bg-gradient-to-b from-black via-black/60 to-transparent px-4 md:top-16">
        <Link href="/" className="pointer-events-auto" aria-label="AuraTok — início">
          <BrandLogo className="text-sm" markClassName="size-5" />
        </Link>

        <div className="pointer-events-auto flex items-center gap-5 text-xs font-bold uppercase tracking-[0.12em]">
          <button type="button" className="text-zinc-600">
            Seguindo
          </button>
          <button
            type="button"
            className="relative text-white after:absolute after:-bottom-2.5 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-aura"
          >
            Para você
          </button>
        </div>

        <Link
          href="/upload"
          aria-label="Publicar vídeo"
          className="pointer-events-auto grid size-9 place-items-center rounded-xl bg-aura text-black"
        >
          <Plus size={18} strokeWidth={2.8} />
        </Link>
      </header>

      <div className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post, index) => (
          <article
            key={`${post.user.username}-${index}`}
            className="relative h-full min-h-[620px] snap-start snap-always overflow-hidden bg-zinc-950"
          >
            {index === 0 ? (
              <Image
                src="/auratok-skate-hero.png"
                alt="Skatista em uma manobra urbana"
                fill
                priority
                loading="eager"
                sizes="(max-width: 767px) 100vw, 520px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_26%,#536d0b_0%,#202516_22%,#0b0b0b_66%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/95" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-aura" />

            <button
              type="button"
              aria-label="Ativar som"
              className="absolute right-4 top-20 z-20 grid size-9 place-items-center rounded-xl border border-white/10 bg-black/45 text-white backdrop-blur-md transition hover:border-aura/30"
            >
              <Volume2 size={16} />
            </button>

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ amount: 0.7 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute left-4 top-20 z-20 rounded-xl border border-aura/25 bg-black/60 px-3 py-2.5 backdrop-blur-xl"
            >
              <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Aura capturada
              </span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <motion.strong
                  initial={{ scale: 0.85 }}
                  whileInView={{ scale: [0.85, 1.08, 1] }}
                  viewport={{ amount: 0.7 }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                  className="text-xl font-black tabular-nums text-aura"
                >
                  +{post.points.toLocaleString("pt-BR")}
                </motion.strong>
                <BrandMark className="size-4 text-aura" />
              </div>
            </motion.div>

            <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-[minmax(0,1fr)_56px] items-end gap-4 px-4 pb-24 pt-24 md:pb-8">
              <div className="min-w-0">
                <Link
                  href={`/perfil/${post.user.username}`}
                  className="mb-3 inline-flex items-center gap-2.5"
                >
                  <span className="grid size-10 place-items-center rounded-xl border border-white/20 bg-zinc-900 text-[11px] font-black">
                    {post.user.avatar}
                  </span>
                  <strong className="text-sm">@{post.user.username}</strong>
                  <span className="rounded-lg border border-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    Seguir
                  </span>
                </Link>
                <p className="max-w-sm text-sm leading-6 text-white/95">
                  {post.caption}
                </p>
                <div className="mt-3 flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-300">
                  <Music2 size={14} className="shrink-0 text-aura" />
                  <span className="truncate">
                    Som original · @{post.user.username}
                  </span>
                </div>
              </div>

              <aside
                className="flex flex-col items-center gap-5 pb-1"
                aria-label="Ações do vídeo"
              >
                <motion.button
                  whileTap={{ scale: 0.78 }}
                  type="button"
                  aria-label="Curtir"
                  className={actionClass}
                >
                  <Heart size={27} />
                  <span className="text-[10px] font-semibold">
                    {index === 0 ? "12,8 mil" : "8.421"}
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.78 }}
                  type="button"
                  aria-label="Comentar"
                  className={actionClass}
                >
                  <MessageCircle size={26} />
                  <span className="text-[10px] font-semibold">
                    {index === 0 ? "684" : "392"}
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.78 }}
                  type="button"
                  aria-label="Compartilhar"
                  className={actionClass}
                >
                  <Send size={25} />
                  <span className="text-[10px] font-semibold">
                    {index === 0 ? "1.204" : "829"}
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.78 }}
                  type="button"
                  aria-label="Salvar"
                  className={actionClass}
                >
                  <Bookmark size={25} />
                </motion.button>
              </aside>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
