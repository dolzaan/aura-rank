"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Compass, Search, Trophy, Users, Upload, UserRound } from "lucide-react";
import { clsx } from "clsx";
import { useSession } from "next-auth/react";
import { BrandLogo } from "@/components/brand";

const baseLinks = [
  ["Feed", "/feed", Compass],
  ["Ranking", "/ranking", Trophy],
  ["Postar", "/upload", Upload],
  ["Ligas", "/ligas", Users],
] as const;

export function Nav() {
  const pathname = usePathname();
  const [pendingNavigation, setPendingNavigation] = useState<{
    href: string;
    from: string;
  } | null>(null);
  const { data: session } = useSession();
  const username = session?.user?.username;
  const links = [
    ...baseLinks,
    ["Perfil", username ? `/perfil/${username}` : "/onboarding", UserRound] as const,
  ];
  const isLandingPage = pathname === "/";
  const pendingHref =
    pendingNavigation?.from === pathname ? pendingNavigation.href : null;

  function markPending(href: string) {
    if (pathname === href || pathname.startsWith(`${href}/`)) return;
    setPendingNavigation({ href, from: pathname });
  }
  if (
    pathname.startsWith("/entrar") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/onboarding")
  ) {
    return null;
  }

  return (
    <>
      {pendingHref ? (
        <span className="fixed inset-x-0 top-0 z-[120] h-0.5 animate-pulse bg-aura shadow-[0_0_14px_#c7ff32]" />
      ) : null}
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 hidden border-b border-white/[.07] bg-[#050505]/90 backdrop-blur-2xl md:block",
          isLandingPage && "md:hidden",
        )}
      >
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-6">
          <Link href="/" aria-label="AuraTok — início">
            <BrandLogo className="text-[21px]" markClassName="size-8" />
          </Link>

          <nav
            className="flex items-center gap-1 rounded-2xl border border-white/[.07] bg-white/[.025] p-1"
            aria-label="Navegação principal"
          >
            {links.map(([label, href, Icon]) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => markPending(href)}
                  className={clsx(
                    "flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition",
                    active || pendingHref === href
                      ? "bg-aura text-black"
                      : "text-zinc-500 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon size={16} strokeWidth={2.2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/buscar"
              onClick={() => markPending("/buscar")}
              aria-label="Pesquisar perfis e vídeos"
              className="grid size-10 place-items-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 transition hover:border-aura/40 hover:text-aura"
            >
              <Search size={18} />
            </Link>
            <Link
              href={username ? `/perfil/${username}` : "/onboarding"}
              onClick={() =>
                markPending(username ? `/perfil/${username}` : "/onboarding")
              }
              aria-label="Abrir meu perfil"
              className="grid size-10 place-items-center rounded-xl border border-white/10 bg-zinc-900 text-[11px] font-black transition hover:border-aura/40 hover:text-aura"
            >
              {(session?.user?.name || username || "AT")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label="Navegação principal mobile"
        className="fixed inset-x-0 bottom-0 z-[100] grid min-h-[calc(64px+env(safe-area-inset-bottom))] grid-cols-5 border-t border-white/10 bg-[#080808]/[.98] px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,.42)] backdrop-blur-2xl [transform:translateZ(0)] md:hidden"
      >
        {links.map(([label, href, Icon]) => {
          const active =
            (pathname === "/" && href === "/feed") ||
            pathname === href ||
            pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => markPending(href)}
              aria-label={label}
              className={clsx(
                "relative flex min-h-[64px] flex-col items-center justify-center gap-1 text-[9px] font-bold transition active:scale-95 min-[380px]:text-[10px]",
                active || pendingHref === href
                  ? "text-aura before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:rounded-b-full before:bg-aura before:shadow-[0_0_12px_#c7ff32]"
                  : "text-zinc-500 active:bg-white/10 active:text-white",
              )}
            >
              <Icon
                size={href === "/upload" ? 23 : 21}
                strokeWidth={active || pendingHref === href ? 2.7 : 2}
                className={clsx(
                  href === "/upload" &&
                    "rounded-lg border border-white/30 px-1 text-white",
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
