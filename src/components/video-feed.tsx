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
  Heart,
  LoaderCircle,
  MessageCircle,
  Plus,
  Play,
  Send,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { BrandMark } from "@/components/brand";

type FeedPost = {
  id: string;
  user: {
    username: string;
    name: string;
    image: string | null;
    isDemo: boolean;
    aura: number;
    trend: string;
    avatar: string;
  };
  points: number;
  caption: string;
  aiSummary: string;
  videoUrl: string;
  fallbackVideoUrl: string;
  tags: string[];
  commentCount: number;
  likeCount: number;
  saveCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  isOwn: boolean;
  sourceUrl: string | null;
  sourceName: string | null;
};

type FeedPage = {
  posts: FeedPost[];
  nextCursor: string | null;
  seed: string;
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

function createFeedSeed() {
  const values = crypto.getRandomValues(new Uint32Array(4));
  return Array.from(values, (value) => value.toString(36)).join("-");
}

async function requestFeedPage({
  mode,
  seed,
  cursor,
  signal,
}: {
  mode: "following" | "foryou";
  seed: string;
  cursor?: string | null;
  signal?: AbortSignal;
}) {
  const params = new URLSearchParams({ seed });
  if (mode === "following") params.set("mode", "following");
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(`/api/feed?${params.toString()}`, {
    cache: "no-store",
    signal,
  });
  const payload = (await response.json()) as Partial<FeedPage> & {
    error?: string;
  };
  if (!response.ok) throw new Error(payload.error || "Feed indisponível");

  return {
    posts: payload.posts || [],
    nextCursor: payload.nextCursor || null,
    seed: payload.seed || seed,
  } satisfies FeedPage;
}

function Avatar({
  username,
  name,
  image,
  className,
}: {
  username: string;
  name: string;
  image: string | null;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-aura text-xs font-black text-black",
        className,
      )}
    >
      {image ? (
        <Image
          src={`/api/avatar/${encodeURIComponent(username)}`}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
          unoptimized
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function VideoFeed({ className }: { className?: string }) {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [mode, setMode] = useState<"following" | "foryou">("foryou");
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  const [feedHasMore, setFeedHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [feedRevision, setFeedRevision] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSending, setCommentSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [auraBurst, setAuraBurst] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [pausedVideoId, setPausedVideoId] = useState<string | null>(null);
  const [bufferingVideoIds, setBufferingVideoIds] = useState<Set<string>>(
    () => new Set(),
  );
  const commentInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedSeedRef = useRef("");
  const feedRequestIdRef = useRef(0);
  const feedLoadingMoreRef = useRef(false);
  const activeVideoId = feedPosts[activeIndex]?.id || null;

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++feedRequestIdRef.current;
    const seed = createFeedSeed();
    feedSeedRef.current = seed;
    feedLoadingMoreRef.current = false;

    requestFeedPage({ mode, seed, signal: controller.signal })
      .then((page) => {
        if (requestId !== feedRequestIdRef.current) return;
        feedSeedRef.current = page.seed;
        setFeedLoadingMore(false);
        setFeedPosts(page.posts);
        setNextCursor(page.nextCursor);
        setFeedHasMore(Boolean(page.nextCursor));
        setActiveIndex(0);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (requestId === feedRequestIdRef.current) {
          setToast("Não foi possível carregar o feed");
        }
      })
      .finally(() => {
        if (requestId === feedRequestIdRef.current) setFeedLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [mode, feedRevision]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (burstTimer.current) clearTimeout(burstTimer.current);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    for (const [videoId, video] of videoRefs.current) {
      if (videoId !== activeVideoId) {
        video.pause();
        continue;
      }

      video.muted = isMuted;
      void video.play().then(
        () => {
          if (!cancelled) setPausedVideoId(null);
        },
        () => {
          if (cancelled) return;
          video.muted = true;
          setIsMuted(true);
          void video.play().then(
            () => setPausedVideoId(null),
            () => setPausedVideoId(videoId),
          );
        },
      );
    }
    return () => {
      cancelled = true;
    };
  }, [activeVideoId, isMuted]);

  const activePost = useMemo(
    () => feedPosts.find((post) => post.id === commentVideoId) || null,
    [commentVideoId, feedPosts],
  );

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }

  function updatePost(postId: string, update: Partial<FeedPost>) {
    setFeedPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, ...update } : post)),
    );
  }

  function setVideoBuffering(videoId: string, buffering: boolean) {
    setBufferingVideoIds((current) => {
      const next = new Set(current);
      if (buffering) next.add(videoId);
      else next.delete(videoId);
      return next;
    });
  }

  function togglePlayback(videoId: string) {
    const video = videoRefs.current.get(videoId);
    if (!video) return;
    if (video.paused) {
      void video.play().then(
        () => setPausedVideoId(null),
        () => setPausedVideoId(videoId),
      );
    } else {
      video.pause();
      setPausedVideoId(videoId);
    }
  }

  function recoverVideoPlayback(post: FeedPost) {
    const video = videoRefs.current.get(post.id);
    if (!video || video.dataset.recoveryAttempted === "true") return false;

    video.dataset.recoveryAttempted = "true";
    setVideoBuffering(post.id, true);
    updatePost(post.id, { videoUrl: post.fallbackVideoUrl });
    video.src = post.fallbackVideoUrl;
    video.load();
    video.muted = isMuted;
    if (post.id === activeVideoId) {
      void video.play().catch((error) => {
        console.error("[feed] Falha na recuperação do vídeo", {
          videoId: post.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }
    return true;
  }

  function toggleMute(videoId: string) {
    const nextMuted = !isMuted;
    const video = videoRefs.current.get(videoId);
    setIsMuted(nextMuted);
    if (video) {
      video.muted = nextMuted;
      video.volume = 1;
      if (!nextMuted) {
        void video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          showToast("O navegador bloqueou o áudio. Toque novamente.");
        });
      }
    }
    showToast(nextMuted ? "Som desativado" : "Som ativado");
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const container = event.currentTarget;
    const nextIndex = Math.min(
      feedPosts.length - 1,
      Math.max(0, Math.round(container.scrollTop / container.clientHeight)),
    );
    if (nextIndex !== activeIndex) setActiveIndex(nextIndex);
    if (nextIndex >= feedPosts.length - 3) void loadMoreFeed();
  }

  async function loadMoreFeed() {
    if (
      feedLoading ||
      feedLoadingMoreRef.current ||
      !feedHasMore ||
      !nextCursor
    ) {
      return;
    }

    const requestId = feedRequestIdRef.current;
    const seed = feedSeedRef.current;
    feedLoadingMoreRef.current = true;
    setFeedLoadingMore(true);
    try {
      const page = await requestFeedPage({ mode, seed, cursor: nextCursor });
      if (
        requestId !== feedRequestIdRef.current ||
        seed !== feedSeedRef.current
      ) {
        return;
      }

      setFeedPosts((current) => {
        const loadedIds = new Set(current.map((post) => post.id));
        const newPosts = page.posts.filter((post) => !loadedIds.has(post.id));
        return [...current, ...newPosts];
      });
      setNextCursor(page.nextCursor);
      setFeedHasMore(Boolean(page.nextCursor));
    } catch {
      if (requestId === feedRequestIdRef.current) {
        showToast("Não foi possível carregar mais vídeos");
      }
    } finally {
      if (requestId === feedRequestIdRef.current) {
        feedLoadingMoreRef.current = false;
        setFeedLoadingMore(false);
      }
    }
  }

  async function toggleFollow(post: FeedPost) {
    if (post.isOwn) return;
    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(post.user.username)}/follow`,
        { method: "POST" },
      );
      const payload = (await response.json()) as {
        following?: boolean;
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error);
      setFeedPosts((current) =>
        current.map((item) =>
          item.user.username === post.user.username
            ? { ...item, isFollowing: Boolean(payload.following) }
            : item,
        ),
      );
      showToast(
        payload.following
          ? `Agora você segue @${post.user.username}`
          : "Você deixou de seguir",
      );
    } catch {
      showToast("Não foi possível atualizar");
    }
  }

  async function interact(post: FeedPost, action: "like" | "save" | "share") {
    try {
      const response = await fetch(`/api/videos/${post.id}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json()) as {
        active?: boolean;
        likeCount?: number;
        saveCount?: number;
        shareCount?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error);
      updatePost(post.id, {
        ...(action === "like" ? { isLiked: Boolean(payload.active) } : {}),
        ...(action === "save" ? { isSaved: Boolean(payload.active) } : {}),
        likeCount: payload.likeCount ?? post.likeCount,
        saveCount: payload.saveCount ?? post.saveCount,
        shareCount: payload.shareCount ?? post.shareCount,
      });
      if (action === "like" && payload.active) {
        setAuraBurst(post.id);
        if (burstTimer.current) clearTimeout(burstTimer.current);
        burstTimer.current = setTimeout(() => setAuraBurst(null), 900);
      }
      if (action === "save") {
        showToast(payload.active ? "Salvo na sua coleção" : "Removido dos salvos");
      }
    } catch {
      showToast("Não foi possível atualizar");
    }
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
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showToast("Link copiado");
      }
      await interact(post, "share");
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
      updatePost(postId, { commentCount: payload.count || 0 });
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
      const response = await fetch(`/api/videos/${commentVideoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: value, parentId: replyingTo?.id }),
      });
      const payload = (await response.json()) as {
        comment?: CommentItem;
        error?: string;
      };
      if (!response.ok || !payload.comment) throw new Error(payload.error);
      setComments((current) => [...current, payload.comment!]);
      updatePost(commentVideoId, {
        commentCount:
          (feedPosts.find((post) => post.id === commentVideoId)?.commentCount ||
            0) + 1,
      });
      setCommentText("");
      setReplyingTo(null);
      showToast(replyingTo ? "Resposta publicada" : "Comentário publicado");
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
        className={clsx(
          "flex gap-3",
          nested && "ml-11 border-l border-white/10 pl-3",
        )}
      >
        <Avatar
          username={comment.user.username}
          name={comment.user.name}
          image={comment.user.image}
          className={nested ? "size-8" : "size-9"}
        />
        <div className="min-w-0">
          <p className={clsx("text-xs font-bold", !nested && "text-aura")}>
            @{comment.user.username}
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
        <div className="pointer-events-auto flex min-w-0 items-center justify-center gap-5 whitespace-nowrap text-xs font-bold uppercase tracking-[0.12em]">
          {(["following", "foryou"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (item !== mode) {
                  setFeedLoading(true);
                  setMode(item);
                } else {
                  setFeedLoading(true);
                  setFeedRevision((current) => current + 1);
                }
              }}
              className={clsx(
                "relative",
                mode === item
                  ? "text-white after:absolute after:-bottom-2.5 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-aura"
                  : "text-zinc-600",
              )}
            >
              {item === "following" ? "Seguindo" : "Para você"}
            </button>
          ))}
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
      </header>

      {feedLoading ? (
        <div className="grid h-full place-items-center text-aura">
          <LoaderCircle className="animate-spin" size={28} />
        </div>
      ) : feedPosts.length === 0 ? (
        <div className="grid h-full place-items-center px-8 text-center">
          <div>
            <Sparkles className="mx-auto text-aura" size={32} />
            <h2 className="mt-5 text-xl font-black">
              {mode === "following" ? "Seu feed Seguindo está vazio" : "Nada por aqui ainda"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {mode === "following"
                ? "Siga alguém no Para você para montar este feed."
                : "Publique o primeiro vídeo e comece a farmar aura."}
            </p>
            {mode === "following" ? (
              <button
                type="button"
                onClick={() => {
                  setFeedLoading(true);
                  setMode("foryou");
                }}
                className="primary-button mt-5 px-5"
              >
                Descobrir perfis
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={handleScroll}
        >
          {feedPosts.map((post, index) => (
            <article
              id={`video-${post.id}`}
              key={post.id}
              onClick={(event) => {
                const target = event.target as Element;
                if (target.closest("a, button, input, textarea, select")) return;
                togglePlayback(post.id);
              }}
              onDoubleClick={() => void interact(post, "like")}
              className="relative h-full min-h-0 snap-start snap-always overflow-hidden bg-zinc-950"
            >
              <video
                ref={(node) => {
                  if (node) videoRefs.current.set(post.id, node);
                  else videoRefs.current.delete(post.id);
                }}
                src={post.videoUrl}
                muted={isMuted}
                playsInline
                loop
                autoPlay={index === activeIndex}
                preload={
                  index >= activeIndex && index <= activeIndex + 1
                    ? "metadata"
                    : "none"
                }
                onLoadStart={() => setVideoBuffering(post.id, true)}
                onLoadedMetadata={(event) => {
                  event.currentTarget.defaultPlaybackRate = 1;
                  event.currentTarget.playbackRate = 1;
                }}
                onCanPlay={() => setVideoBuffering(post.id, false)}
                onPlaying={() => {
                  setVideoBuffering(post.id, false);
                  setPausedVideoId(null);
                }}
                onWaiting={() => setVideoBuffering(post.id, true)}
                onStalled={() => {
                  if (index === activeIndex) recoverVideoPlayback(post);
                }}
                onPause={() => setPausedVideoId(post.id)}
                onError={(event) => {
                  setVideoBuffering(post.id, false);
                  const mediaError = event.currentTarget.error;
                  console.error("[feed] Erro ao reproduzir vídeo", {
                    videoId: post.id,
                    code: mediaError?.code,
                    message: mediaError?.message,
                    source: event.currentTarget.currentSrc,
                  });
                  if (
                    index === activeIndex &&
                    !recoverVideoPlayback(post)
                  ) {
                    showToast("Não foi possível reproduzir este vídeo");
                  }
                }}
                className="absolute inset-0 size-full cursor-pointer object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/95" />

              <AnimatePresence>
                {bufferingVideoIds.has(post.id) ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-[15] grid place-items-center"
                  >
                    <span className="grid size-14 place-items-center rounded-full bg-black/45 backdrop-blur-md">
                      <LoaderCircle className="animate-spin text-aura" size={26} />
                    </span>
                  </motion.div>
                ) : pausedVideoId === post.id ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="pointer-events-none absolute inset-0 z-[15] grid place-items-center"
                  >
                    <span className="grid size-16 place-items-center rounded-full bg-black/50 backdrop-blur-md">
                      <Play className="ml-1 text-white" fill="white" size={28} />
                    </span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="absolute left-3 top-[calc(env(safe-area-inset-top)+4.5rem)] z-20 rounded-xl border border-aura/25 bg-black/60 px-3 py-2 backdrop-blur-xl md:top-20">
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Aura capturada
                </span>
                <strong className="mt-0.5 block text-lg font-black text-aura">
                  +{post.points.toLocaleString("pt-BR")}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => toggleMute(post.id)}
                aria-label={isMuted ? "Ativar som" : "Silenciar vídeo"}
                className={clsx(
                  "absolute right-3 top-[calc(env(safe-area-inset-top)+4.75rem)] z-20 grid size-9 place-items-center rounded-full border border-white/10 bg-black/45 text-white/75 shadow-lg backdrop-blur-md transition hover:bg-black/70 hover:text-white active:scale-90 md:top-20",
                  !isMuted && "border-aura/30 text-aura",
                )}
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>

              <AnimatePresence>
                {auraBurst === post.id ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="pointer-events-none absolute inset-0 z-30 grid place-items-center"
                  >
                    <Heart size={86} fill="#c7ff32" className="text-aura drop-shadow-[0_0_32px_#c7ff32]" />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 flex items-end gap-3 px-4 pb-5 md:bottom-0 md:pb-7">
                <div className="min-w-0 flex-1 pr-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/perfil/${post.user.username}`} className="font-black">
                      @{post.user.username}
                    </Link>
                    {post.user.isDemo ? (
                      <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-zinc-300">
                        demonstração
                      </span>
                    ) : null}
                    {!post.isOwn ? (
                      <button
                        type="button"
                        onClick={() => void toggleFollow(post)}
                        className={clsx(
                          "rounded-full border px-3 py-1 text-[10px] font-black transition",
                          post.isFollowing
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-aura bg-aura text-black",
                        )}
                      >
                        {post.isFollowing ? "Seguindo" : "Seguir"}
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-1.5 line-clamp-1 max-w-lg text-xs font-medium leading-4 text-white sm:text-sm sm:leading-5">
                    {post.caption}
                  </p>
                  <div className="feed-ai-summary mt-2 rounded-xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-lg">
                    <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-aura">
                      <Sparkles size={12} /> Leitura da IA
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-300 sm:text-xs">
                      {post.aiSummary}
                    </p>
                  </div>
                  {post.sourceUrl && post.sourceName ? (
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-[9px] text-zinc-500 hover:text-white"
                    >
                      Vídeo: {post.sourceName}
                    </a>
                  ) : null}
                </div>

                <aside aria-label="Ações do vídeo" className="flex w-12 shrink-0 flex-col items-center gap-5 pb-1">
                  <Link href={`/perfil/${post.user.username}`}>
                    <Avatar
                      username={post.user.username}
                      name={post.user.name}
                      image={post.user.image}
                      className="size-11 border-2 border-white"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => void interact(post, "like")}
                    aria-label={post.isLiked ? "Descurtir" : "Curtir"}
                    className={actionClass}
                  >
                    <Heart
                      size={29}
                      fill={post.isLiked ? "#c7ff32" : "transparent"}
                      className={post.isLiked ? "text-aura" : ""}
                    />
                    <span className="text-[10px] font-bold">{formatCount(post.likeCount)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void openComments(post.id)}
                    aria-label="Comentar"
                    className={actionClass}
                  >
                    <MessageCircle size={28} />
                    <span className="text-[10px] font-bold">{formatCount(post.commentCount)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void shareVideo(post)}
                    aria-label="Compartilhar"
                    className={actionClass}
                  >
                    <Share2 size={27} />
                    <span className="text-[10px] font-bold">{formatCount(post.shareCount)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void interact(post, "save")}
                    aria-label={post.isSaved ? "Remover dos salvos" : "Salvar"}
                    className={actionClass}
                  >
                    <Bookmark
                      size={27}
                      fill={post.isSaved ? "#c7ff32" : "transparent"}
                      className={post.isSaved ? "text-aura" : ""}
                    />
                  </button>
                </aside>
              </div>
            </article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {feedLoadingMore ? (
          <motion.div
            aria-live="polite"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute bottom-[calc(78px+env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-2 text-[10px] font-bold text-zinc-300 backdrop-blur-xl md:bottom-5"
          >
            <LoaderCircle className="animate-spin text-aura" size={14} />
            Buscando mais aura
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {commentVideoId ? (
          <>
            <motion.button
              type="button"
              aria-label="Fechar comentários"
              onClick={() => setCommentVideoId(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/55"
            />
            <motion.section
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-[60] flex max-h-[72%] min-h-[48%] flex-col rounded-t-[28px] border-t border-white/10 bg-[#0b0b0b] pb-[env(safe-area-inset-bottom)]"
            >
              <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 className="font-black">Comentários</h2>
                  <p className="text-[10px] text-zinc-500">
                    {activePost?.commentCount || 0} conversas reais
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCommentVideoId(null)}
                  aria-label="Fechar"
                  className="grid size-9 place-items-center rounded-full bg-white/5"
                >
                  <X size={18} />
                </button>
              </header>
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {commentsLoading ? (
                  <LoaderCircle className="mx-auto animate-spin text-aura" size={24} />
                ) : comments.length ? (
                  comments
                    .filter((comment) => !comment.parentId)
                    .flatMap((comment) => [
                      renderComment(comment),
                      ...comments
                        .filter((reply) => reply.parentId === comment.id)
                        .map((reply) => renderComment(reply, true)),
                    ])
                ) : (
                  <p className="py-10 text-center text-sm text-zinc-600">
                    Seja a primeira pessoa a comentar.
                  </p>
                )}
              </div>
              <form onSubmit={submitComment} className="border-t border-white/10 p-3">
                {replyingTo ? (
                  <div className="mb-2 flex items-center justify-between px-2 text-[10px] text-zinc-500">
                    <span>Respondendo @{replyingTo.user.username}</span>
                    <button type="button" onClick={() => setReplyingTo(null)}>
                      Cancelar
                    </button>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
                  <input
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Adicione um comentário..."
                    maxLength={500}
                    className="min-h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentSending}
                    aria-label="Enviar comentário"
                    className="grid size-10 place-items-center rounded-xl bg-aura text-black disabled:opacity-40"
                  >
                    {commentSending ? (
                      <LoaderCircle className="animate-spin" size={17} />
                    ) : (
                      <Send size={17} />
                    )}
                  </button>
                </div>
              </form>
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-none absolute bottom-24 left-1/2 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-aura px-4 py-2 text-xs font-black text-black md:bottom-7"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
