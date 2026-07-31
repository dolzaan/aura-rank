"use client";

import { useState } from "react";
import { Check, Film, LoaderCircle, Sparkles, UploadCloud } from "lucide-react";
import { BrandMark } from "@/components/brand";

export default function Upload() {
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setResult(847);
    setLoading(false);
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="text-center">
        <span className="eyebrow">Novo conteúdo</span>
        <h1 className="page-title mt-5">
          Transforme presença
          <br />
          em <span className="text-aura">aura.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
          Envie um vídeo de até 45 segundos. A IA analisa execução,
          originalidade e impacto.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="surface p-5 sm:p-7">
          <label className="group grid min-h-[260px] cursor-pointer place-items-center rounded-2xl border border-dashed border-white/15 bg-black/30 p-6 text-center transition hover:border-aura/50 hover:bg-aura/[.025]">
            <input className="sr-only" type="file" accept="video/*" />
            <span>
              <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-aura/20 bg-aura/10 text-aura transition group-hover:scale-105">
                <UploadCloud size={28} />
              </span>
              <strong className="mt-5 block text-xl font-black uppercase tracking-tight">
                Solte seu vídeo aqui
              </strong>
              <span className="mt-2 block text-sm text-zinc-500">
                MP4 ou MOV · máximo de 45 segundos
              </span>
              <span className="secondary-button mt-6 min-h-10 px-4 py-2">
                Escolher arquivo
              </span>
            </span>
          </label>

          <label className="mt-5 block">
            <span className="section-label">Legenda</span>
            <textarea
              className="input mt-2 min-h-28 resize-none"
              rows={4}
              placeholder="Conte o contexto desse momento..."
            />
          </label>

          <button
            type="button"
            className="primary-button mt-4 w-full disabled:cursor-wait disabled:opacity-70"
            onClick={analyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                Analisando presença...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Enviar para análise
              </>
            )}
          </button>
        </div>

        <aside className="surface brand-grid relative overflow-hidden p-6 sm:p-7">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-aura/10 blur-3xl" />
          {result === null ? (
            <div className="relative flex h-full min-h-[380px] flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="section-label">Como funciona</span>
                <Film className="text-aura" size={22} />
              </div>
              <ol className="space-y-5">
                {[
                  "A IA identifica seu momento principal.",
                  "Execução e originalidade viram pontos.",
                  "Sua aura entra no ranking em tempo real.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 text-[10px] font-black text-aura">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-6 text-zinc-400">{item}</p>
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-600">
                <BrandMark className="size-4 text-aura" /> Poste. Impressione.
                Evolua.
              </div>
            </div>
          ) : (
            <div className="relative flex h-full min-h-[380px] flex-col items-center justify-center text-center">
              <span className="grid size-10 place-items-center rounded-full bg-aura text-black">
                <Check size={20} strokeWidth={3} />
              </span>
              <div
                className="score-ring mt-7 size-44"
                style={{ "--score": "84.7%" } as React.CSSProperties}
              >
                <div className="relative z-10">
                  <strong className="block text-4xl font-black">{result}</strong>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-aura">
                    aura
                  </span>
                </div>
              </div>
              <h2 className="mt-7 text-xl font-black uppercase">
                Presença confirmada.
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
                Entrada confiante, original e bem executada.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
