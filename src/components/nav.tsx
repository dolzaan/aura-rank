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
  const isFeed = pathname === "/feed";

  return (
    <>
      <header className={clsx("fixed inset-x-0 top-0 z-50 hidden border-b border-white/10 bg-black/75 backdrop-blur-2xl md:block", isFeed && "md:hidden")}>
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-black tracking-[-.04em]">AURA<span className="text-lime-300">RANK</span></Link>
          <nav className="flex items-center gap-1" aria-label="Navegação principal">
            {links.map(([label, href, Icon]) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link key={href} href={href} className={clsx("flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition", active ? "bg-white text-black" : "text-zinc-400 hover:bg-white/5 hover:text-white")}>
                  <Icon size={16} strokeWidth={2.2} />{label}
                </Link>
              );
            })}
          </nav>
          <Link href="/perfil/dolzaan" aria-label="Abrir perfil" className="grid size-9 place-items-center rounded-full border border-white/15 bg-zinc-900 text-[11px] font-black">PD</Link>
        </div>
      </header>

      <nav aria-label="Navegação principal mobile" className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-5 rounded-[22px] border border-white/10 bg-zinc-950/90 p-1.5 shadow-2xl shadow-black/80 backdrop-blur-2xl md:hidden">
        {links.map(([label, href, Icon]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-label={label} className={clsx("flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-[17px] text-[10px] font-semibold transition active:scale-95", active ? "bg-white text-black" : "text-zinc-500 active:bg-white/10 active:text-white")}>
              <Icon size={20} strokeWidth={active ? 2.6 : 2} /><span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
