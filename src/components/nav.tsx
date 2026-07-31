"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Trophy, Users, Upload, UserRound } from "lucide-react";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/brand";

const links = [
  ["Feed", "/feed", Compass],
  ["Ranking", "/ranking", Trophy],
  ["Postar", "/upload", Upload],
  ["Ligas", "/ligas", Users],
  ["Perfil", "/perfil/dolzaan", UserRound],
] as const;

export function Nav() {
  const pathname = usePathname();
  const isFeed = pathname === "/feed";

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 hidden border-b border-white/[.07] bg-[#050505]/80 backdrop-blur-2xl md:block",
          isFeed && "md:hidden",
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
                  className={clsx(
                    "flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition",
                    active
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

          <Link
            href="/perfil/dolzaan"
            aria-label="Abrir perfil de Paulo Dolzan"
            className="grid size-10 place-items-center rounded-xl border border-white/10 bg-zinc-900 text-[11px] font-black transition hover:border-aura/40 hover:text-aura"
          >
            PD
          </Link>
        </div>
      </header>

      <nav
        aria-label="Navegação principal mobile"
        className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-5 rounded-[20px] border border-white/10 bg-[#080808]/92 p-1.5 shadow-2xl shadow-black/80 backdrop-blur-2xl md:hidden"
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
              aria-label={label}
              className={clsx(
                "flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-[14px] text-[10px] font-bold transition active:scale-95",
                active
                  ? "bg-aura text-black"
                  : "text-zinc-500 active:bg-white/10 active:text-white",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.6 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
