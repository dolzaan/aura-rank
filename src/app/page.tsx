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

      <div className="landing-shell mx-auto hidden min-h-dvh w-full max-w-[1440px] px-4 py-4 md:block lg:px-6 lg:py-6">
        <section className="landing-card surface brand-grid relative min-h-[calc(100dvh-2rem)] overflow-hidden lg:min-h-[calc(100dvh-3rem)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(199,255,50,.16),transparent_27rem)]" />
          <div className="landing-layout relative grid min-h-[inherit] grid-cols-1 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
            <div className="landing-copy relative z-10 flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-[clamp(2.5rem,4vw,4rem)] lg:py-[clamp(2.5rem,6vh,4.5rem)]">
              <span className="eyebrow">Poste. Impressione. Evolua.</span>
              <h1 className="landing-title mt-7 max-w-xl text-[clamp(3.2rem,8vw,6.5rem)] font-black uppercase leading-[0.82] tracking-[-0.075em] lg:text-[clamp(4rem,6.5vw,6.8rem)]">
                Sua aura.
                <br />
                <span className="text-aura">Seu impacto.</span>
              </h1>
              <p className="landing-description mt-5 max-w-lg text-base leading-7 text-zinc-400 lg:mt-7 lg:text-lg lg:leading-8">
                Um feed de vídeos onde cada momento ganha uma pontuação e
                presença vira reputação.
              </p>
              <div className="landing-actions mt-6 flex flex-wrap gap-3 lg:mt-8">
                <Link href="/feed" className="primary-button">
                  Abrir o feed <Play size={17} fill="currentColor" />
                </Link>
                <Link href="/upload" className="secondary-button">
                  Enviar vídeo <ArrowRight size={17} />
                </Link>
              </div>

              <div className="landing-highlights mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 lg:mt-10 lg:pt-6">
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

            <div className="landing-visual relative min-h-[clamp(360px,48vh,620px)] overflow-hidden border-t border-white/10 lg:min-h-0 lg:border-l lg:border-t-0">
              <Image
                src="/auratok-skate-hero.png"
                alt="Skatista realizando uma manobra sob luz verde-limão"
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/10" />
              <div className="absolute right-5 top-5 rounded-2xl border border-aura/30 bg-black/70 px-4 py-3 backdrop-blur-xl lg:right-8 lg:top-8">
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Aura capturada
                </span>
                <strong className="mt-1 flex items-center gap-2 text-2xl font-black text-aura">
                  +342 AURA <BrandMark className="size-5" />
                </strong>
              </div>
              <div className="landing-visual-caption absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8">
                <span className="section-label rounded-lg border border-aura/30 bg-black/70 px-3 py-2 text-aura backdrop-blur">
                  Feed mobile-first
                </span>
                <p className="mt-4 max-w-md text-2xl font-black uppercase leading-none tracking-tight lg:mt-5 lg:text-3xl">
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
