import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { BrandMark } from "@/components/brand";

const features = [
  {
    icon: Sparkles,
    index: "01",
    title: "IA que lê presença",
    text: "Estilo, execução, originalidade e impacto traduzidos em uma pontuação clara.",
  },
  {
    icon: Trophy,
    index: "02",
    title: "Ranking que pulsa",
    text: "Suba posições, desbloqueie ligas e transforme consistência em reputação.",
  },
  {
    icon: Users,
    index: "03",
    title: "Competição com contexto",
    text: "Dispute com amigos e creators sem perder o foco no conteúdo que importa.",
  },
] as const;

const stats = [
  ["12,8M", "aura acumulada"],
  ["48K", "vídeos postados"],
  ["9,2K", "ligas ativas"],
] as const;

const benefits = [
  {
    icon: BarChart3,
    title: "Métrica real",
    text: "Acompanhe a evolução do seu impacto.",
  },
  {
    icon: ShieldCheck,
    title: "Conteúdo seguro",
    text: "Moderação pensada para a comunidade.",
  },
  {
    icon: Zap,
    title: "Feedback imediato",
    text: "Veja o que fez seu momento funcionar.",
  },
  {
    icon: Play,
    title: "Formato que flui",
    text: "Descoberta rápida, sem distrações.",
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-5">
      <section className="surface brand-grid relative min-h-[680px] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(199,255,50,.16),transparent_27rem)]" />
        <div className="relative grid min-h-[680px] lg:grid-cols-[1.02fr_.98fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <span className="eyebrow">Poste. Impressione. Evolua.</span>
            <h1 className="mt-6 max-w-[720px] text-balance text-[clamp(3.5rem,8vw,7.6rem)] font-black uppercase leading-[0.82] tracking-[-0.075em]">
              Sua aura.
              <br />
              <span className="text-aura">Seu impacto.</span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              AuraTok é a rede social onde presença vira reputação. Poste,
              inspire e acumule aura.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/feed" className="primary-button">
                Começar agora <BrandMark className="size-4" />
              </Link>
              <Link href="/upload" className="secondary-button">
                Enviar vídeo <ArrowRight size={17} />
              </Link>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {stats.map(([value, label]) => (
                <div key={label}>
                  <strong className="block text-xl font-black tracking-tight text-white sm:text-2xl">
                    {value}
                  </strong>
                  <span className="mt-1 block text-[10px] uppercase leading-4 tracking-[0.12em] text-zinc-600 sm:text-xs">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden border-t border-white/10 lg:min-h-0 lg:border-l lg:border-t-0">
            <div className="aura-rings pointer-events-none absolute -left-24 top-1/2 z-0 size-[520px] -translate-y-1/2 opacity-70" />
            <Image
              src="/auratok-skate-hero.png"
              alt="Skatista realizando uma manobra sob luz verde-limão"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover object-[52%_38%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/20 lg:bg-gradient-to-r lg:from-black/35 lg:via-transparent lg:to-black/5" />

            <div className="absolute right-5 top-5 rounded-2xl border border-aura/30 bg-black/70 px-4 py-3 backdrop-blur-xl sm:right-8 sm:top-8">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Aura capturada
              </span>
              <strong className="mt-1 block text-2xl font-black text-aura">
                +342 AURA
              </strong>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
              <div>
                <span className="mb-2 inline-flex rounded-md border border-aura/30 bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-aura backdrop-blur">
                  Em alta
                </span>
                <p className="max-w-xs text-2xl font-black leading-none tracking-tight sm:text-3xl">
                  Consistência que leva ao próximo nível.
                </p>
              </div>
              <Link
                href="/feed"
                aria-label="Reproduzir conteúdo em destaque"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-aura text-black transition hover:scale-105"
              >
                <Play size={18} fill="currentColor" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, index, title, text }) => (
          <article
            key={title}
            className="surface surface-hover relative overflow-hidden p-6 sm:p-7"
          >
            <span className="absolute right-5 top-4 text-5xl font-black tracking-[-0.08em] text-white/[.035]">
              {index}
            </span>
            <div className="grid size-11 place-items-center rounded-xl border border-aura/20 bg-aura/10 text-aura">
              <Icon size={21} />
            </div>
            <h2 className="mt-6 text-xl font-black uppercase tracking-[-0.04em]">
              {title}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
              {text}
            </p>
          </article>
        ))}
      </section>

      <section className="surface overflow-hidden">
        <div className="grid lg:grid-cols-[.75fr_1.25fr]">
          <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden border-b border-white/10 bg-aura p-7 text-black sm:p-10 lg:border-b-0 lg:border-r">
            <div className="absolute -right-20 -top-20 size-64 rounded-full border-[42px] border-black/10" />
            <BrandMark className="relative size-14" />
            <div className="relative">
              <p className="max-w-sm text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-5xl">
                Sua marca no mundo começa com presença.
              </p>
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] opacity-60">
                AuraTok · 2026
              </p>
            </div>
          </div>

          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-[#0d0d0d] p-7 sm:p-8">
                <Icon className="text-aura" size={22} />
                <h3 className="mt-8 text-lg font-black uppercase tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
