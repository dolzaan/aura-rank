"use client";

import {
  FormEvent,
  UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  Check,
  Heart,
  LoaderCircle,
  MessageCircle,
  Plus,
  Send,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { BrandMark } from "@/components/brand";
import { posts as demoPosts } from "@/lib/mock";

type FeedPost = {
  id: string;
  user: {
    username: string;
    name: string;
    aura: number;
    trend: string;
    avatar: string;
  };
  points: number;
  caption: string;
  aiSummary: string;
  videoUrl: string | null;
  tags: string[];
  commentCount?: number;
};

type CommentItem = {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  user: {
    name: string;
    username: string;
    image: string | null;
  };
};

const actionClass =
  "relative flex flex-col items-center gap-1 border-0 bg-transparent text-white drop-shadow-lg transition active:scale-90";

function formatCount(value: number) {
  if (value >= 10000) {
    return `${(value / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  }
  return value.toLocaleString("pt-BR");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getVisitorId() {
  const storageKey = "auratok-visitor-id";
  const current = window.localStorage.getItem(storageKey);
  if (current) return current;
  const created = crypto.randomUUID();
  window.localStorage.setItem(storageKey, created);
  return created;
}

export function VideoFeed({ className }: { className?: string }) {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(demoPosts);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    Object.fromEntries(demoPosts.map((post) => [post.id, 0])),
  );
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSending, setCommentSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [auraBurst, setAuraBurst] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/feed", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return { posts: [] as FeedPost[] };
        return (await response.json()) as { posts: FeedPost[] };
      })
      .then(({ posts }) => {
        if (cancelled || !posts.length) return;
        setFeedPosts([
          ...posts,
          ...demoPosts.filter(
            (demo) => !posts.some((post) => post.id === demo.id),
          ),
        ]);
        setCommentCounts((current) => ({
          ...current,
          ...Object.fromEntries(
            posts.map((post) => [post.id, post.commentCount || 0]),
          ),
        }));
      })
      .catch(() => {
        // O feed demonstrativo continua disponível se a API estiver offline.
      });
    return () => {
      cancelled = true;
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (burstTimer.current) clearTimeout(burstTimer.current);
    };
  }, []);

  const activePost = useMemo(
    () => feedPosts.find((post) => post.id === commentVideoId) || null,
    [commentVideoId, feedPosts],
  );

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const container = event.currentTarget;
    const nextIndex = Math.min(
      feedPosts.length - 1,
      Math.max(0, Math.round(container.scrollTop / container.clientHeight)),
    );
    if (nextIndex !== activeIndex) setActiveIndex(nextIndex);
  }

  function toggleFollow(username: string) {
    const next = !following[username];
    setFollowing((current) => ({ ...current, [username]: next }));
    showToast(next ? `Agora você segue @${username}` : "Você deixou de seguir");
  }

  function toggleLike(postId: string) {
    const next = !liked[postId];
    setLiked((current) => ({ ...current, [postId]: next }));
    if (next) {
      setAuraBurst(postId);
      if (burstTimer.current) clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setAuraBurst(null), 900);
    }
  }

  function toggleSave(postId: string) {
    const next = !saved[postId];
    setSaved((current) => ({ ...current, [postId]: next }));
    showToast(next ? "Salvo na sua coleção" : "Removido dos salvos");
  }

  async function shareVideo(post: FeedPost) {
    const shareData = {
      title: `Veja a aura de @${post.user.username}`,
      text: post.caption,
      url: `${window.location.origin}/feed#video-${post.id}`,
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

  async function openComments(postId: string) {
    setCommentVideoId(postId);
    setReplyingTo(null);
    setCommentText("");
    setComments([]);
    setCommentsLoading(true);
    try {
      const response = await fetch(`/api/videos/${postId}/comments`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        comments?: CommentItem[];
        count?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error);
      setComments(payload.comments || []);
      setCommentCounts((current) => ({
        ...current,
        [postId]: payload.count || 0,
      }));
    } catch {
      showToast("Não foi possível carregar os comentários");
    } finally {
      setCommentsLoading(false);
    }
  }

  function startReply(comment: CommentItem) {
    setReplyingTo(comment);
    requestAnimationFrame(() => commentInputRef.current?.focus());
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = commentText.trim();
    if (!value || !commentVideoId || commentSending) return;

    setCommentSending(true);
    try {
      const response = await fetch(
        `/api/videos/${commentVideoId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: value,
            parentId: replyingTo?.id,
            visitorId: getVisitorId(),
          }),
        },
      );
      const payload = (await response.json()) as {
        comment?: CommentItem;
        error?: string;
      };
      if (!response.ok || !payload.comment) {
        throw new Error(payload.error);
      }
      setComments((current) => [...current, payload.comment!]);
      setCommentCounts((current) => ({
        ...current,
        [commentVideoId]: (current[commentVideoId] || 0) + 1,
      }));
      setCommentText("");
      setReplyingTo(null);
      showToast(replyingTo ? "Resposta publicada" : "+3 aura por participar");
    } catch {
      showToast("Não foi possível publicar");
    } finally {
      setCommentSending(false);
    }
  }

  function renderComment(comment: CommentItem, nested = false) {
    return (
      <div
        key={comment.id}
        className={clsx("flex gap-3", nested && "ml-11 border-l border-white/10 pl-3")}
      >
        <span
          className={clsx(
            "grid shrink-0 place-items-center rounded-full text-[10px] font-black",
            nested ? "size-8 bg-zinc-800" : "size-9 bg-aura text-black",
          )}
        >
          {initials(comment.user.name)}
        </span>
        <div className="min-w-0">
          <p className={clsx("text-xs font-bold", !nested && "text-aura")}>
            {comment.user.name}
          </p>
          <p className="mt-1 break-words text-sm leading-5 text-zinc-200">
            {comment.body}
          </p>
          <button
            type="button"
            onClick={() => startReply(comment)}
            className="mt-2 text-[10px] font-semibold text-zinc-500 transition hover:text-aura"
          >
            Responder
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      className={clsx(
        "feed-shell relative mx-auto h-dvh w-full overflow-hidden bg-black md:mt-[76px] md:h-[calc(100dvh-76px)] md:max-w-[560px] md:border-x md:border-white/10 lg:max-w-[620px] xl:max-w-[680px]",
        className,
      )}
    >
      <header
        data-testid="feed-header"
        className="pointer-events-none fixed left-1/2 top-0 z-40 grid h-[calc(60px+env(safe-area-inset-top))] w-full -translate-x-1/2 grid-cols-[42px_minmax(0,1fr)_42px] items-center bg-gradient-to-b from-black via-black/65 to-transparent px-3 pt-[env(safe-area-inset-top)] md:top-[76px] md:h-16 md:max-w-[560px] md:pt-0 lg:max-w-[620px] xl:max-w-[680px]"
      >
        <div className="flex items-center">
          <AnimatePresence>
            {activeIndex === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Link
                  href="/"
                  className="pointer-events-auto grid size-8 place-items-center text-aura md:hidden"
                  aria-label="AuraTok — início"
                >
                  <BrandMark className="size-6" />
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <div className="pointer-events-auto flex min-w-0 items-center justify-center gap-3 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em] min-[360px]:gap-5 min-[360px]:text-xs min-[360px]:tracking-[0.12em]">
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
        <div className="flex justify-end">
          <Link
            href="/upload"
            aria-label="Publicar vídeo"
            className="pointer-events-auto grid size-9 place-items-center rounded-lg bg-aura text-black md:bg-white/10 md:text-white"
          >
            <Plus size={18} strokeWidth={2.8} />
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-aura shadow-[0_0_14px_#c7ff32]"
            animate={{
              width: `${((activeIndex + 1) / feedPosts.length) * 100}%`,
            }}
          />
        </div>
      </header>

      <div
        className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {feedPosts.map((post, index) => {
          const isLiked = Boolean(liked[post.id]);
          const isSaved = Boolean(saved[post.id]);
          const isFollowing = Boolean(following[post.user.username]);
          const likes = index === 0 ? 12800 : 8421 + index * 137;
          const shares = index === 0 ? 1204 : 829 + index * 51;

          return (
            <article
              id={`video-${post.id}`}
              key={post.id}
              onDoubleClick={() => toggleLike(post.id)}
              className="relative h-full min-h-0 snap-start snap-always overflow-hidden bg-zinc-950"
            >
              {post.videoUrl ? (
                <video
                  src={post.videoUrl}
                  muted
                  playsInline
                  loop
                  autoPlay={index === activeIndex}
                  preload={Math.abs(index - activeIndex) <= 1 ? "metadata" : "none"}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : index === feedPosts.findIndex((item) => !item.videoUrl) ? (
                <Image
                  src="/auratok-skate-hero.png"
                  alt="Skatista em uma manobra urbana"
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 560px, (max-width: 1279px) 620px, 680px"
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
                className="feed-score-card absolute left-3 top-[calc(env(safe-area-inset-top)+4.5rem)] z-20 rounded-xl border border-aura/25 bg-black/60 px-3 py-2 backdrop-blur-xl min-[380px]:left-4 md:top-20 md:px-3 md:py-2.5"
              >
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Aura capturada
                </span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <strong className="text-xl font-black tabular-nums text-aura">
                    +{post.points.toLocaleString("pt-BR")}
                  </strong>
                  <BrandMark className="size-4 text-aura" />
                </div>
              </motion.div>

              <AnimatePresence>
                {auraBurst === post.id ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: [0.4, 1.18, 1] }}
                    exit={{ opacity: 0, y: -40, scale: 0.7 }}
                    className="pointer-events-none absolute inset-0 z-30 grid place-items-center"
                  >
                    <div className="relative grid size-28 place-items-center rounded-full bg-aura/15 text-aura backdrop-blur-sm">
                      <Heart size={58} fill="currentColor" />
                      <span className="absolute -top-5 text-sm font-black">
                        +5 AURA
                      </span>
                      <Sparkles className="absolute -right-8 -top-8" size={18} />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div
                data-testid="feed-content"
                className="feed-content absolute inset-x-0 bottom-0 z-20 grid grid-cols-[minmax(0,1fr)_48px] items-end gap-2 px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-24 min-[380px]:grid-cols-[minmax(0,1fr)_52px] min-[380px]:gap-3 min-[380px]:px-4 md:grid-cols-[minmax(0,1fr)_56px] md:gap-4 md:px-5 md:pb-8"
              >
                <div className="min-w-0">
                  <div className="mb-2 flex min-w-0 items-center gap-2 min-[380px]:mb-3 min-[380px]:gap-2.5">
                    <Link
                      href={`/perfil/${post.user.username}`}
                      className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-zinc-900 text-[10px] font-black min-[380px]:size-10 min-[380px]:text-[11px]"
                    >
                      {post.user.avatar}
                    </Link>
                    <Link
                      href={`/perfil/${post.user.username}`}
                      className="min-w-0 truncate text-xs font-bold min-[380px]:text-sm"
                    >
                      @{post.user.username}
                    </Link>
                    <button
                      type="button"
                      aria-pressed={isFollowing}
                      onClick={() => toggleFollow(post.user.username)}
                      className={clsx(
                        "min-h-7 shrink-0 rounded-lg px-2 text-[9px] font-black uppercase tracking-wider transition active:scale-95 min-[380px]:px-3 min-[380px]:text-[10px]",
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
                  <p className="line-clamp-2 max-w-md text-xs leading-5 text-white/95 min-[380px]:text-sm min-[380px]:leading-6">
                    {post.caption}
                  </p>
                  <div className="feed-ai-summary mt-2 max-w-md rounded-xl border border-aura/15 bg-black/45 px-2.5 py-2 backdrop-blur-md min-[380px]:mt-3 min-[380px]:px-3">
                    <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-aura">
                      <Sparkles size={11} /> Leitura da IA
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-300 min-[380px]:text-xs min-[380px]:leading-5">
                      {post.aiSummary}
                    </p>
                  </div>
                </div>

                <aside
                  data-testid="feed-actions"
                  className="feed-actions flex flex-col items-center gap-4 pb-1 min-[380px]:gap-5"
                  aria-label="Ações do vídeo"
                >
                  <motion.button
                    whileTap={{ scale: 0.72 }}
                    type="button"
                    aria-label={isLiked ? "Remover curtida" : "Curtir"}
                    aria-pressed={isLiked}
                    onClick={() => toggleLike(post.id)}
                    className={clsx(actionClass, isLiked && "text-aura")}
                  >
                    <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                    <span className="text-[10px] font-semibold">
                      {formatCount(likes + (isLiked ? 1 : 0))}
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.72 }}
                    type="button"
                    aria-label="Comentar"
                    onClick={() => void openComments(post.id)}
                    className={actionClass}
                  >
                    <MessageCircle size={27} />
                    <span className="text-[10px] font-semibold">
                      {formatCount(commentCounts[post.id] || 0)}
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.72 }}
                    type="button"
                    aria-label="Compartilhar"
                    onClick={() => void shareVideo(post)}
                    className={actionClass}
                  >
                    <Share2 size={26} />
                    <span className="text-[10px] font-semibold">
                      {formatCount(shares)}
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.72 }}
                    type="button"
                    aria-label={isSaved ? "Remover dos salvos" : "Salvar"}
                    aria-pressed={isSaved}
                    onClick={() => toggleSave(post.id)}
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
            className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[80] mx-auto flex w-fit items-center gap-2 rounded-full border border-aura/30 bg-aura px-4 py-2.5 text-xs font-black text-black md:bottom-8"
          >
            <BrandMark className="size-4" />
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {commentVideoId && activePost ? (
          <>
            <motion.button
              type="button"
              aria-label="Fechar comentários"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommentVideoId(null)}
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
              className="fixed inset-x-0 bottom-0 z-[71] mx-auto flex max-h-[calc(100dvh-3.5rem)] w-full max-w-[520px] flex-col rounded-t-[28px] border border-white/10 bg-[#0b0b0b] pb-[env(safe-area-inset-bottom)] shadow-2xl md:max-h-[72dvh] md:max-w-[560px] lg:max-w-[620px]"
            >
              <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-zinc-700" />
              <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 id="comments-title" className="font-black">
                    Comentários
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatCount(commentCounts[commentVideoId] || 0)} respostas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCommentVideoId(null)}
                  aria-label="Fechar"
                  className="icon-button"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {commentsLoading ? (
                  <div className="grid min-h-40 place-items-center text-aura">
                    <LoaderCircle className="animate-spin" size={24} />
                  </div>
                ) : comments.length ? (
                  comments
                    .filter((comment) => !comment.parentId)
                    .map((comment) => (
                      <div key={comment.id} className="space-y-4">
                        {renderComment(comment)}
                        {comments
                          .filter((reply) => reply.parentId === comment.id)
                          .map((reply) => renderComment(reply, true))}
                      </div>
                    ))
                ) : (
                  <div className="grid min-h-40 place-items-center text-center">
                    <div>
                      <MessageCircle
                        className="mx-auto text-zinc-700"
                        size={28}
                      />
                      <p className="mt-3 text-sm font-bold">
                        Seja a primeira presença
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        Comece a conversa sobre este momento.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {replyingTo ? (
                <div className="flex items-center justify-between border-t border-white/10 bg-white/[.025] px-4 py-2 text-xs text-zinc-400">
                  <span>
                    Respondendo a{" "}
                    <strong className="text-aura">
                      {replyingTo.user.name}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    aria-label="Cancelar resposta"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null}
              <form
                onSubmit={(event) => void submitComment(event)}
                className="flex gap-2 border-t border-white/10 bg-[#0b0b0b] p-4"
              >
                <label htmlFor="new-comment" className="sr-only">
                  Adicionar comentário
                </label>
                <input
                  ref={commentInputRef}
                  id="new-comment"
                  value={commentText}
                  maxLength={500}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder={
                    replyingTo
                      ? `Responder a ${replyingTo.user.name}...`
                      : "Adicione sua presença..."
                  }
                  className="input min-w-0 !w-auto flex-1"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentSending}
                  aria-label="Publicar comentário"
                  className="grid size-12 shrink-0 place-items-center rounded-xl bg-aura text-black transition disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {commentSending ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <Send size={19} />
                  )}
                </button>
              </form>
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
