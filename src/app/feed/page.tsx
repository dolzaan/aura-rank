"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Music2,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";
import { posts } from "@/lib/mock";

const actionClass =
  "flex flex-col items-center gap-1 border-0 bg-transparent text-white drop-shadow-lg transition active:scale-90";

export default function Feed() {
  return (
    <section className="mx-auto h-dvh w-full max-w-[520px] overflow-hidden bg-black md:mt-16 md:h-[calc(100dvh-4rem)] md:border-x md:border-white/10">
      <header className="pointer-events-none fixed left-1/2 top-0 z-40 flex h-16 w-full max-w-[520px] -translate-x-1/2 items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 md:top-16">
        <Link href="/" className="pointer-events-auto text-sm font-black tracking-tight">
          AuraRank
        </Link>

        <div className="pointer-events-auto flex items-center gap-5 text-sm font-semibold">
          <button className="text-zinc-500">Seguindo</button>
          <button className="relative text-white after:absolute after:-bottom-2 after:left-1/2 after:h-0.5 after:w-5 after:-translate-x-1/2 after:rounded-full after:bg-white">
            Para você
          </button>
        </div>

        <Link
          href="/upload"
          aria-label="Publicar vídeo"
          className="pointer-events-auto grid size-9 place-items-center rounded-full bg-white text-xl font-light text-black"
        >
          +
        </Link>
      </header>

      <div className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post, index) => (
          <article
            key={`${post.user.username}-${index}`}
            className="relative h-full min-h-[620px] snap-start snap-always overflow-hidden bg-zinc-950"
          >
            <div
              className={`absolute inset-0 ${
                index % 2 === 0
                  ? "bg-[radial-gradient(circle_at_30%_20%,#333_0%,#181818_38%,#050505_76%)]"
                  : "bg-[radial-gradient(circle_at_70%_25%,#302a35_0%,#171717_40%,#050505_78%)]"
              }`}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/90" />

            <button
              type="button"
              aria-label="Ativar som"
              className="absolute right-4 top-20 z-20 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/60"
            >
              <Volume2 size={17} />
            </button>

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ amount: 0.7 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute left-4 top-20 z-20 overflow-hidden rounded-2xl border border-white/10 bg-black/50 px-3 py-2.5 backdrop-blur-xl"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Aura farmada
              </span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <motion.strong
                  initial={{ scale: 0.85 }}
                  whileInView={{ scale: [0.85, 1.08, 1] }}
                  viewport={{ amount: 0.7 }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                  className="text-xl font-black tabular-nums text-lime-300"
                >
                  +{post.points.toLocaleString("pt-BR")}
                </motion.strong>
                <Sparkles size={15} className="text-lime-300" />
              </div>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ amount: 0.65 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute left-4 right-4 top-[132px] z-20 h-0.5 origin-left rounded-full bg-lime-300/80"
            />

            <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-[minmax(0,1fr)_56px] items-end gap-4 px-4 pb-24 pt-24 md:pb-8">
              <div className="min-w-0">
                <Link
                  href={`/perfil/${post.user.username}`}
                  className="mb-3 inline-flex items-center gap-2.5"
                >
                  <span className="grid size-10 place-items-center rounded-full border border-white/20 bg-zinc-900 text-[11px] font-black">
                    {post.user.avatar}
                  </span>
                  <strong className="text-sm">@{post.user.username}</strong>
                  <span className="rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold">
                    Seguir
                  </span>
                </Link>

                <p className="max-w-sm text-sm leading-6 text-white/95">{post.caption}</p>

                <div className="mt-3 flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-300">
                  <Music2 size={14} className="shrink-0" />
                  <span className="truncate">Som original • @{post.user.username}</span>
                </div>
              </div>

              <aside className="flex flex-col items-center gap-5 pb-1" aria-label="Ações do vídeo">
                <motion.button whileTap={{ scale: 0.78 }} type="button" aria-label="Curtir" className={actionClass}>
                  <Heart size={28} />
                  <span className="text-[10px] font-semibold">{index === 0 ? "12,8 mil" : "8.421"}</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.78 }} type="button" aria-label="Comentar" className={actionClass}>
                  <MessageCircle size={27} />
                  <span className="text-[10px] font-semibold">{index === 0 ? "684" : "392"}</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.78 }} type="button" aria-label="Compartilhar" className={actionClass}>
                  <Send size={26} />
                  <span className="text-[10px] font-semibold">{index === 0 ? "1.204" : "829"}</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.78 }} type="button" aria-label="Salvar" className={actionClass}>
                  <Bookmark size={26} />
                </motion.button>
              </aside>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
