"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Trophy, Users, Upload, UserRound } from "lucide-react";
import { clsx } from "clsx";

const links = [
  ["Feed", "/feed", Flame],
  ["Ranking", "/ranking", Trophy],
  ["Farmar", "/upload", Upload],
  ["Ligas", "/ligas", Users],
  ["Perfil", "/perfil/dolzaan", UserRound],
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 hidden border-b border-white/10 bg-black/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-black tracking-tight">
            AuraRank
          </Link>

          <div className="flex items-center gap-1">
            {links.map(([label, href, Icon]) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/perfil/dolzaan"
            className="grid size-9 place-items-center rounded-full border border-white/15 bg-zinc-900 text-xs font-bold"
          >
            PD
          </Link>
        </div>
      </nav>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-black/85 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl md:hidden">
        {links.map(([label, href, Icon]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={clsx(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition",
                active ? "bg-white text-black" : "text-zinc-400 active:bg-white/10",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
