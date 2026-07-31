import Link from "next/link";
import { ArrowUpRight, Play, Sparkles, Trophy, Users, WandSparkles } from "lucide-react";

const features = [
  { icon: WandSparkles, title: "IA que entende presença", text: "Cada vídeo recebe uma leitura clara de estilo, execução, originalidade e impacto." },
  { icon: Trophy, title: "Ranking que dá vontade de voltar", text: "Suba posições, desbloqueie ligas e acompanhe sua evolução de aura." },
  { icon: Users, title: "Competição com contexto", text: "Dispute com amigos, creators e comunidades sem perder o foco no conteúdo." },
];

export default function Home() {
  return (
    <div className="space-y-5">
      <section className="surface relative overflow-hidden px-5 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(199,255,50,.16),transparent_24rem)]" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_.72fr]">
          <div>
            <span className="eyebrow"><Sparkles size={14} /> Sua presença vale pontos</span>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black leading-[.92] tracking-[-.065em] sm:text-7xl lg:text-[92px]">
              Farme aura.<br /><span className="text-lime-300">Vire referência.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-400 sm:text-xl sm:leading-8">
              Uma rede social de vídeos curtos onde presença, estilo e originalidade viram reputação real.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/feed" className="primary-button"><Play size={18} fill="currentColor" /> Explorar feed</Link>
              <Link href="/upload" className="secondary-button">Farmar agora <ArrowUpRight size={18} /></Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-5 border-t border-white/10 pt-6">
              {[['12,8M','aura farmada'],['48K','vídeos'],['9,2K','ligas']].map(([value,label]) => (
                <div key={label}><strong className="block text-xl font-black sm:text-2xl">{value}</strong><span className="text-xs text-zinc-500 sm:text-sm">{label}</span></div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[330px]">
            <div className="absolute -inset-8 rounded-full bg-lime-300/10 blur-3xl" />
            <div className="relative aspect-[9/16] overflow-hidden rounded-[34px] border border-white/15 bg-[radial-gradient(circle_at_45%_20%,#343434_0%,#171717_38%,#050505_76%)] shadow-2xl shadow-black">
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90" />
              <div className="absolute inset-x-4 top-4 flex items-center justify-between rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs backdrop-blur-xl">
                <span className="font-bold">@dolzaan</span><span className="font-black text-lime-300">+847 aura</span>
              </div>
              <div className="absolute inset-x-5 bottom-6">
                <div className="mb-4 inline-flex rounded-full bg-lime-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">Top 3 hoje</div>
                <p className="text-3xl font-black leading-none tracking-tight">Presença que<br />não passa batida.</p>
                <p className="mt-3 text-sm text-zinc-300">#confiança #estilo #aurarank</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <article key={title} className="surface p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20">
            <div className="grid size-11 place-items-center rounded-2xl bg-lime-300/10 text-lime-300"><Icon size={21} /></div>
            <h2 className="mt-5 text-xl font-black tracking-tight">{title}</h2>
            <p className="mt-2 leading-7 text-zinc-400">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
