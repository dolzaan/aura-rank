import {
  ArrowUpRight,
  CalendarDays,
  Copy,
  Crown,
  Plus,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

const leagues = [
  {
    name: "Aura dos Saletansos",
    members: 8,
    position: 2,
    progress: 76,
    ending: "Termina amanhã",
    score: "12.480",
  },
  {
    name: "Criadores de SP",
    members: 24,
    position: 7,
    progress: 48,
    ending: "Termina em 5 dias",
    score: "8.920",
  },
];

export default function Ligas() {
  return (
    <main className="space-y-10 pb-28 pt-6 sm:pb-12 sm:pt-10">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Compita junto</p>
          <h1 className="page-title mt-3">Suas ligas</h1>
          <p className="mt-3 max-w-xl text-zinc-400">
            Rankings privados para transformar a disputa entre amigos em mais
            histórias memoráveis.
          </p>
        </div>
        <button className="primary-button w-full sm:w-auto">
          <Plus size={18} />
          Criar liga
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {leagues.map((league, index) => (
          <article
            key={league.name}
            className="surface surface-hover group overflow-hidden p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-aura text-black">
                {index === 0 ? <Crown size={22} /> : <Trophy size={22} />}
              </div>
              <ArrowUpRight
                className="text-zinc-600 transition group-hover:text-aura"
                size={22}
              />
            </div>

            <h2 className="mt-8 text-2xl font-bold">{league.name}</h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
              <span className="flex items-center gap-2">
                <Users size={15} /> {league.members} participantes
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays size={15} /> {league.ending}
              </span>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Sua posição
                </p>
                <p className="mt-1 text-xl font-semibold">
                  <span className="text-aura">#{league.position}</span> na liga
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Aura
                </p>
                <p className="mt-1 font-semibold">{league.score}</p>
              </div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-aura shadow-[0_0_18px_rgba(199,255,50,.7)]"
                style={{ width: `${league.progress}%` }}
              />
            </div>
          </article>
        ))}
      </section>

      <section className="brand-grid surface grid overflow-hidden lg:grid-cols-[1.15fr_.85fr]">
        <div className="p-7 sm:p-10">
          <span className="section-label">Você foi convidado</span>
          <h2 className="mt-5 text-3xl font-bold">Equipe do escritório</h2>
          <p className="mt-3 max-w-md text-zinc-400">
            Entre na liga, acompanhe as missões semanais e prove quem tem mais
            presença no time.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button className="primary-button">
              <Sparkles size={17} />
              Entrar na liga
            </button>
            <button className="secondary-button">
              <Copy size={17} />
              AURA-7F2K
            </button>
          </div>
        </div>
        <div className="relative grid min-h-64 place-items-center border-t border-white/10 bg-aura/5 lg:border-l lg:border-t-0">
          <div className="aura-rings absolute h-72 w-72" />
          <div className="relative text-center">
            <p className="text-6xl font-black tracking-tighter text-aura">08</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
              competidores
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
