"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  LoaderCircle,
  MessageCircle,
  Play,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

type SearchResults = {
  profiles: Array<{
    id: string;
    username: string;
    name: string;
    bio: string | null;
    hasImage: boolean;
    aura: number;
    followerCount: number;
  }>;
  videos: Array<{
    id: string;
    caption: string;
    points: number;
    mediaUrl: string;
    likeCount: number;
    commentCount: number;
    user: {
      username: string;
      name: string;
      hasImage: boolean;
    };
  }>;
};

const EMPTY_RESULTS: SearchResults = { profiles: [], videos: [] };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const normalizedQuery = query.trim();

  useEffect(() => {
    if (normalizedQuery.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (response) => {
          const payload = (await response.json()) as SearchResults & {
            error?: string;
          };
          if (!response.ok) throw new Error(payload.error || "Busca indisponível");
          setResults(payload);
        })
        .catch((caught) => {
          if (caught instanceof DOMException && caught.name === "AbortError") return;
          setError("Não foi possível concluir a busca.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery]);

  function changeQuery(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      setError("");
    } else {
      setLoading(true);
    }
  }

  const hasResults = results.profiles.length > 0 || results.videos.length > 0;
  const searched = normalizedQuery.length >= 2 && !loading;

  return (
    <main
      aria-busy={loading}
      className="mx-auto min-h-dvh w-full max-w-5xl pb-28 pt-5 md:min-h-0 md:pb-12 md:pt-8"
    >
      <header className="sticky top-0 z-30 -mx-3 bg-[#050505]/95 px-3 pb-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl md:top-[76px] md:-mx-5 md:px-5 md:pt-4">
        <p className="eyebrow mb-3">Descobrir</p>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            size={19}
          />
          <input
            type="search"
            value={query}
            onChange={changeQuery}
            autoFocus
            enterKeyHint="search"
            placeholder="Pesquisar perfis ou vídeos"
            aria-label="Pesquisar perfis ou vídeos"
            className="input min-h-14 rounded-2xl pl-12 pr-12 text-base"
          />
          {loading ? (
            <LoaderCircle
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-aura"
              size={19}
            />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(EMPTY_RESULTS);
                setError("");
              }}
              aria-label="Limpar pesquisa"
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-zinc-500 hover:bg-white/5 hover:text-white"
            >
              <X size={17} />
            </button>
          ) : null}
        </div>
      </header>

      {normalizedQuery.length < 2 ? (
        <section className="surface mt-6 grid min-h-72 place-items-center p-8 text-center">
          <div>
            <Search className="mx-auto text-aura" size={34} />
            <h1 className="mt-5 text-2xl font-black">Encontre sua próxima aura</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Pesquise por nome, @username, biografia, legenda ou criador do vídeo.
            </p>
          </div>
        </section>
      ) : error ? (
        <p role="alert" className="surface mt-6 p-6 text-sm font-semibold text-red-400">
          {error}
        </p>
      ) : searched && !hasResults ? (
        <section className="surface mt-6 grid min-h-56 place-items-center p-8 text-center">
          <div>
            <Sparkles className="mx-auto text-aura" size={30} />
            <h2 className="mt-4 text-xl font-black">Nenhum resultado</h2>
            <p className="mt-2 text-sm text-zinc-500">Tente outro nome ou palavra-chave.</p>
          </div>
        </section>
      ) : (
        <div className="space-y-9 pt-5">
          {results.profiles.length > 0 ? (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="text-aura" size={17} />
                <h2 className="text-sm font-black uppercase tracking-[0.12em]">Perfis</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {results.profiles.map((profile) => (
                  <Link
                    key={profile.id}
                    href={`/perfil/${profile.username}`}
                    prefetch={false}
                    className="surface flex items-center gap-4 p-4 transition hover:border-aura/30 hover:bg-white/[.025]"
                  >
                    <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-aura text-xs font-black text-black">
                      {profile.hasImage ? (
                        <Image
                          src={`/api/avatar/${encodeURIComponent(profile.username)}`}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        initials(profile.name)
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate">{profile.name}</strong>
                      <span className="block truncate text-xs text-zinc-500">
                        @{profile.username} · {profile.followerCount} seguidores
                      </span>
                      {profile.bio ? (
                        <span className="mt-1 block truncate text-xs text-zinc-400">
                          {profile.bio}
                        </span>
                      ) : null}
                    </span>
                    <strong className="text-xs text-aura">{profile.aura} aura</strong>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {results.videos.length > 0 ? (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Play className="text-aura" size={17} fill="currentColor" />
                <h2 className="text-sm font-black uppercase tracking-[0.12em]">Vídeos</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {results.videos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/feed?video=${video.id}`}
                    className="surface group relative aspect-[3/4] overflow-hidden"
                  >
                    <video
                      src={video.mediaUrl}
                      muted
                      playsInline
                      preload="none"
                      className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/20" />
                    <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-black text-aura">
                      +{video.points}
                    </span>
                    <Play
                      className="absolute inset-0 m-auto text-white drop-shadow-lg"
                      size={28}
                      fill="white"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <strong className="block truncate text-xs">@{video.user.username}</strong>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-zinc-300">
                        {video.caption}
                      </p>
                      <div className="mt-2 flex gap-3 text-[9px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Heart size={10} /> {video.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={10} /> {video.commentCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </main>
  );
}
