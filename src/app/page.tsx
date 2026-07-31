import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Trophy, Users } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { VideoFeed } from "@/components/video-feed";

const productHighlights = [
  { icon: Sparkles, value: "IA", label: "avalia presença" },
  { icon: Trophy, value: "Aura", label: "vira reputação" },
  { icon: Users, value: "Ligas", label: "conectam amigos" },
] as const;

export default function Home() {
  return (
    <>
      <VideoFeed className="md:hidden" />

      <div className="mx-auto hidden min-h-dvh w-full max-w-[1240px] px-6 pb-10 pt-28 md:block">
        <section className="surface brand-grid relative min-h-[calc(100dvh-9rem)] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(199,255,50,.16),transparent_27rem)]" />
          <div className="relative grid min-h-[calc(100dvh-9rem)] grid-cols-[.9fr_1.1fr]">
            <div className="relative z-10 flex flex-col justify-center px-10 py-14 lg:px-14">
              <span className="eyebrow">Poste. Impressione. Evolua.</span>
              <h1 className="mt-7 max-w-xl text-[clamp(4.4rem,7vw,7.4rem)] font-black uppercase leading-[0.82] tracking-[-0.075em]">
                Sua aura.
                <br />
                <span className="text-aura">Seu impacto.</span>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-zinc-400">
                Um feed de vídeos onde cada momento ganha uma pontuação e
                presença vira reputação.
              </p>
              <div className="mt-8 flex gap-3">
                <Link href="/feed" className="primary-button">
                  Abrir o feed <Play size={17} fill="currentColor" />
                </Link>
                <Link href="/upload" className="secondary-button">
                  Enviar vídeo <ArrowRight size={17} />
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                {productHighlights.map(({ icon: Icon, value, label }) => (
                  <div key={value}>
                    <Icon className="mb-3 text-aura" size={18} />
                    <strong className="block text-lg font-black">{value}</strong>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[620px] overflow-hidden border-l border-white/10">
              <Image
                src="/auratok-skate-hero.png"
                alt="Skatista realizando uma manobra sob luz verde-limão"
                fill
                priority
                sizes="55vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/10" />
              <div className="absolute right-8 top-8 rounded-2xl border border-aura/30 bg-black/70 px-4 py-3 backdrop-blur-xl">
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Aura capturada
                </span>
                <strong className="mt-1 flex items-center gap-2 text-2xl font-black text-aura">
                  +342 AURA <BrandMark className="size-5" />
                </strong>
              </div>
              <div className="absolute bottom-8 left-8 right-8">
                <span className="section-label rounded-lg border border-aura/30 bg-black/70 px-3 py-2 text-aura backdrop-blur">
                  Feed mobile-first
                </span>
                <p className="mt-5 max-w-md text-3xl font-black uppercase leading-none tracking-tight">
                  Abra, deslize e descubra quem está acumulando aura.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
