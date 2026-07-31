"use client";

import { FormEvent, UIEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  Check,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { BrandLogo, BrandMark } from "@/components/brand";
import { posts } from "@/lib/mock";

const actionClass =
  "relative flex flex-col items-center gap-1 border-0 bg-transparent text-white drop-shadow-lg transition active:scale-90";

const baseLikes = [12800, 8421];
const baseComments = [684, 392];
const baseShares = [1204, 829];
const initialComments = [
  [
    ["Nina Costa", "Isso foi muito aura 🔥"],
    ["Mari Alves", "A saída sem olhar ganhou tudo."],
    ["Caio Lima", "Como compete com uma presença dessas?"],
  ],
  [
    ["Paulo Dolzan", "Execução absurda."],
    ["Mari Alves", "O replay ficou melhor ainda ✨"],
  ],
] as const;

function formatCount(value: number) {
  if (value >= 10000) {
    return `${(value / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  }
  return value.toLocaleString("pt-BR");
}

export function VideoFeed({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState(baseComments);
  const [addedComments, setAddedComments] = useState<Record<number, string[]>>(
    {},
  );
  const [commentVideo, setCommentVideo] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [auraBurst, setAuraBurst] = useState<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (burstTimer.current) clearTimeout(burstTimer.current);
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const container = event.currentTarget;
    const nextIndex = Math.min(
      posts.length - 1,
      Math.max(0, Math.round(container.scrollTop / container.clientHeight)),
    );
    if (nextIndex !== activeIndex) setActiveIndex(nextIndex);
  }

  function toggleFollow(username: string) {
    const next = !following[username];
    setFollowing((current) => ({ ...current, [username]: next }));
    showToast(next ? `Agora você segue @${username}` : `Você deixou de seguir`);
  }

  function toggleLike(index: number) {
    const next = !liked[index];
    setLiked((current) => ({ ...current, [index]: next }));
    if (next) {
      setAuraBurst(index);
      if (burstTimer.current) clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setAuraBurst(null), 900);
    }
  }

  function toggleSave(index: number) {
    const next = !saved[index];
    setSaved((current) => ({ ...current, [index]: next }));
    showToast(next ? "Salvo na sua coleção" : "Removido dos salvos");
  }

  async function shareVideo(index: number) {
    const post = posts[index];
    const shareData = {
      title: `Veja a aura de @${post.user.username}`,
      text: post.caption,
      url: `${window.location.origin}/feed#video-${index + 1}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast("Compartilhado ✦");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showToast("Link copiado");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        showToast("Não foi possível compartilhar");
      }
    }
  }

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = commentText.trim();
    if (!value || commentVideo === null) return;

    const videoIndex = commentVideo;
    setAddedComments((current) => ({
      ...current,
      [videoIndex]: [value, ...(current[videoIndex] ?? [])],
    }));
    setCommentCounts((current) =>
      current.map((count, index) => (index === videoIndex ? count + 1 : count)),
    );
    setCommentText("");
    showToast("+3 aura por participar");
  }

  return (
    <section
      className={clsx(
        "feed-shell relative mx-auto h-dvh w-full max-w-[520px] overflow-hidden bg-black md:mt-16 md:h-[calc(100dvh-4rem)] md:rounded-t-[28px] md:border-x md:border-t md:border-white/10",
        className,
      )}
    >
      <header className="pointer-events-none fixed left-1/2 top-0 z-40 flex h-[70px] w-full max-w-[520px] -translate-x-1/2 items-center justify-between bg-gradient-to-b from-black via-black/60 to-transparent px-4 md:top-16">
        <div className="w-[84px]">
          <AnimatePresence>
            {activeIndex === 0 ? (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <Link
                  href="/"
                  className="pointer-events-auto"
                  aria-label="AuraTok — início"
                >
                  <BrandLogo className="text-sm" markClassName="size-5" />
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

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

        <div className="flex w-[84px] justify-end">
          <Link
            href="/upload"
            aria-label="Publicar vídeo"
            className="pointer-events-auto grid size-9 place-items-center rounded-xl bg-aura text-black"
          >
            <Plus size={18} strokeWidth={2.8} />
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-aura shadow-[0_0_14px_#c7ff32]"
            animate={{ width: `${((activeIndex + 1) / posts.length) * 100}%` }}
          />
        </div>
      </header>

      <div
        className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {posts.map((post, index) => {
          const isLiked = Boolean(liked[index]);
          const isSaved = Boolean(saved[index]);
          const isFollowing = Boolean(following[post.user.username]);

          return (
            <article
              id={`video-${index + 1}`}
              key={`${post.user.username}-${index}`}
              onDoubleClick={() => toggleLike(index)}
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/95" />

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

              <AnimatePresence>
                {auraBurst === index ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: [0.4, 1.18, 1] }}
                    exit={{ opacity: 0, y: -40, scale: 0.7 }}
                    className="pointer-events-none absolute inset-0 z-30 grid place-items-center"
                  >
                    <div className="relative grid size-28 place-items-center rounded-full bg-aura/15 text-aura backdrop-blur-sm">
                      <Heart size={58} fill="currentColor" />
                      <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: -52 }}
                        className="absolute text-sm font-black"
                      >
                        +5 AURA
                      </motion.span>
                      {[0, 1, 2, 3].map((particle) => (
                        <motion.span
                          key={particle}
                          initial={{ opacity: 1, scale: 0.5 }}
                          animate={{
                            opacity: 0,
                            scale: 1.2,
                            x: particle % 2 === 0 ? -70 : 70,
                            y: particle < 2 ? -70 : 70,
                          }}
                          className="absolute"
                        >
                          <Sparkles size={18} />
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-[minmax(0,1fr)_56px] items-end gap-4 px-4 pb-24 pt-24 md:pb-8">
                <div className="min-w-0">
                  <div className="mb-3 flex items-center gap-2.5">
                    <Link
                      href={`/perfil/${post.user.username}`}
                      aria-label={`Abrir perfil de ${post.user.name}`}
                      className="grid size-10 place-items-center rounded-xl border border-white/20 bg-zinc-900 text-[11px] font-black"
                    >
                      {post.user.avatar}
                    </Link>
                    <Link
                      href={`/perfil/${post.user.username}`}
                      className="text-sm font-bold"
                    >
                      @{post.user.username}
                    </Link>
                    <button
                      type="button"
                      aria-pressed={isFollowing}
                      onClick={() => toggleFollow(post.user.username)}
                      className={clsx(
                        "min-h-7 rounded-lg px-3 text-[10px] font-black uppercase tracking-wider transition active:scale-95",
                        isFollowing
                          ? "bg-aura text-black"
                          : "border border-white/30 text-white",
                      )}
                    >
                      {isFollowing ? (
                        <span className="flex items-center gap-1">
                          <Check size={12} /> Seguindo
                        </span>
                      ) : (
                        "Seguir"
                      )}
                    </button>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-white/95">
                    {post.caption}
                  </p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-aura">
                    Toque duas vezes para dar aura
                  </p>
                </div>

                <aside
                  className="flex flex-col items-center gap-5 pb-1"
                  aria-label="Ações do vídeo"
                >
                  <motion.button
                    whileTap={{ scale: 0.72 }}
                    type="button"
                    aria-label={isLiked ? "Remover curtida" : "Curtir"}
                    aria-pressed={isLiked}
                    onClick={() => toggleLike(index)}
                    className={clsx(actionClass, isLiked && "text-aura")}
                  >
                    <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                    <motion.span
                      key={String(isLiked)}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-[10px] font-semibold"
                    >
                      {formatCount(baseLikes[index] + (isLiked ? 1 : 0))}
                    </motion.span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.72 }}
                    type="button"
                    aria-label="Comentar"
                    onClick={() => setCommentVideo(index)}
                    className={actionClass}
                  >
                    <MessageCircle size={27} />
                    <span className="text-[10px] font-semibold">
                      {formatCount(commentCounts[index])}
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.72 }}
                    type="button"
                    aria-label="Compartilhar"
                    onClick={() => void shareVideo(index)}
                    className={actionClass}
                  >
                    <Share2 size={26} />
                    <span className="text-[10px] font-semibold">
                      {formatCount(baseShares[index])}
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.72 }}
                    type="button"
                    aria-label={isSaved ? "Remover dos salvos" : "Salvar"}
                    aria-pressed={isSaved}
                    onClick={() => toggleSave(index)}
                    className={clsx(actionClass, isSaved && "text-aura")}
                  >
                    <Bookmark
                      size={26}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </motion.button>
                </aside>
              </div>
            </article>
          );
        })}
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed inset-x-0 bottom-28 z-[80] mx-auto flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-aura/30 bg-aura px-4 py-2.5 text-xs font-black text-black shadow-[0_0_35px_rgba(199,255,50,.35)] md:bottom-8"
          >
            <BrandMark className="size-4" />
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {commentVideo !== null ? (
          <>
            <motion.button
              type="button"
              aria-label="Fechar comentários"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommentVideo(null)}
              className="fixed inset-0 z-[70] cursor-default bg-black/55 backdrop-blur-sm"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="comments-title"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[71] mx-auto flex max-h-[72dvh] w-full max-w-[520px] flex-col rounded-t-[28px] border border-white/10 bg-[#0b0b0b] pb-[env(safe-area-inset-bottom)] shadow-2xl"
            >
              <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-zinc-700" />
              <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 id="comments-title" className="font-black">
                    Comentários
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatCount(commentCounts[commentVideo])} respostas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCommentVideo(null)}
                  aria-label="Fechar"
                  className="icon-button"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {(addedComments[commentVideo] ?? []).map((comment, index) => (
                  <div key={`${comment}-${index}`} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-aura text-[10px] font-black text-black">
                      VOCÊ
                    </span>
                    <div>
                      <p className="text-xs font-bold text-aura">Você</p>
                      <p className="mt-1 text-sm leading-5 text-zinc-200">
                        {comment}
                      </p>
                      <span className="mt-2 block text-[10px] font-semibold text-zinc-600">
                        agora · +3 aura
                      </span>
                    </div>
                  </div>
                ))}
                {initialComments[commentVideo].map(([name, comment]) => (
                  <div key={`${name}-${comment}`} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-800 text-[10px] font-black">
                      {name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="text-xs font-bold">{name}</p>
                      <p className="mt-1 text-sm leading-5 text-zinc-300">
                        {comment}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-[10px] font-semibold text-zinc-600"
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={submitComment}
                className="flex gap-2 border-t border-white/10 bg-[#0b0b0b] p-4"
              >
                <label htmlFor="new-comment" className="sr-only">
                  Adicionar comentário
                </label>
                <input
                  id="new-comment"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Adicione sua presença..."
                  className="input min-w-0 !w-auto flex-1"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  aria-label="Publicar comentário"
                  className="grid size-12 shrink-0 place-items-center rounded-xl bg-aura text-black transition disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Send size={19} />
                </button>
              </form>
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
