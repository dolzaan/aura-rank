import { ArrowUp, Crown, Medal, TrendingUp } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { users } from "@/lib/mock";

const medals = ["#C7FF32", "#E4E4E7", "#A77B49"];

export default function Ranking() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">Temporada 07 · 2026</span>
          <h1 className="page-title mt-5">
            Ranking <span className="text-aura">global.</span>
          </h1>
          <p className="mt-4 max-w-xl text-zinc-500">
            Presença não se explica. Se mede.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="primary-button px-5">
            Global
          </button>
          <button type="button" className="secondary-button px-5">
            Amigos
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.45fr]">
        <article className="surface brand-grid relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-aura/10 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <span className="section-label">Sua posição</span>
              <strong className="mt-3 block text-7xl font-black tracking-[-0.08em]">
                03<span className="text-aura">.</span>
              </strong>
            </div>
            <div className="grid size-12 place-items-center rounded-xl bg-aura text-black">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="relative mt-20 flex items-end justify-between gap-4">
            <div>
              <strong className="text-lg">Paulo Dolzan</strong>
              <p className="mt-1 text-sm text-zinc-500">@dolzaan</p>
            </div>
            <div className="text-right">
              <strong className="text-2xl font-black text-aura">23.980</strong>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                aura total
              </p>
            </div>
          </div>
        </article>

        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <span className="section-label">Top creators</span>
            <span className="flex items-center gap-1 text-xs font-bold text-aura">
              <ArrowUp size={13} /> ao vivo
            </span>
          </div>
          {users.map((user, index) => (
            <div
              key={user.username}
              className="grid grid-cols-[42px_1fr_auto] items-center gap-3 border-b border-white/[.07] px-4 py-4 last:border-b-0 sm:grid-cols-[56px_1fr_auto] sm:px-6 sm:py-5"
            >
              <div className="relative grid size-10 place-items-center rounded-xl bg-white/[.04] sm:size-12">
                {index === 0 ? (
                  <Crown size={20} style={{ color: medals[index] }} />
                ) : (
                  <Medal size={19} style={{ color: medals[index] }} />
                )}
                <span className="absolute -left-1 -top-1 grid size-5 place-items-center rounded-md bg-[#1a1a1a] text-[9px] font-black">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0">
                <strong className="block truncate text-sm sm:text-base">
                  {user.name}
                </strong>
                <span className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                  @{user.username}
                  <span className="text-aura">· {user.trend}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <strong className="text-sm font-black tabular-nums sm:text-lg">
                  {user.aura.toLocaleString("pt-BR")}
                </strong>
                <BrandMark className="hidden size-4 text-aura sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
