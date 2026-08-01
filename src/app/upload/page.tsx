"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { uploadPresigned } from "@vercel/blob/client";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Check,
  Film,
  LoaderCircle,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { MobileCameraCapture } from "@/components/mobile-camera-capture";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_DURATION = 45;

type AnalysisResult = {
  submissionId: string;
  totalPoints: number;
  status: "APPROVED" | "REVIEW";
  confidence: number;
  presence: number;
  execution: number;
  originality: number;
  impact: number;
  summary: string;
  creatorFeedback: string;
  publicCaption: string;
  mainMoment: string;
  strengths: string[];
};

function subscribeMobileViewport(callback: () => void) {
  const mediaQuery = window.matchMedia("(max-width: 767px)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function mobileViewportSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function serverMobileViewportSnapshot() {
  return false;
}

export default function Upload() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [caption, setCaption] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useSyncExternalStore(
    subscribeMobileViewport,
    mobileViewportSnapshot,
    serverMobileViewportSnapshot,
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  function clearSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setDuration(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function applyVideo(selected: File) {
    setError(null);
    setResult(null);
    if (!selected.type.startsWith("video/")) {
      setError("Escolha um arquivo de vídeo.");
      clearSelection();
      return;
    }
    if (selected.size > MAX_VIDEO_SIZE) {
      setError("O vídeo deve ter no máximo 50 MB.");
      clearSelection();
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setDuration(null);
  }

  function selectVideo(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) applyVideo(selected);
  }

  async function analyze() {
    if (!file) {
      setError("Escolha um vídeo antes de enviar.");
      return;
    }
    if (duration === null || duration > MAX_DURATION + 0.25) {
      setError("O vídeo deve ter no máximo 45 segundos.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    try {
      setPhase("Enviando vídeo...");
      if (!session?.user?.id) throw new Error("Entre para publicar.");

      const rawExtension = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const extension = rawExtension.replace(/[^a-z0-9]/g, "") || "mp4";
      const pathname = `videos/${session.user.id}/${crypto.randomUUID()}.${extension}`;
      const blob = await uploadPresigned(
        pathname,
        file,
        {
          access: "private",
          handleUploadUrl: "/api/upload",
          contentType: file.type || "video/mp4",
          onUploadProgress: ({ percentage }) => setProgress(percentage),
        },
      );

      setPhase("Gemini está assistindo e avaliando...");
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: blob.url,
          caption: caption.trim() || undefined,
          mimeType: file.type,
          fileName: file.name,
        }),
      });
      const payload = (await response.json()) as AnalysisResult & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "Não foi possível analisar o vídeo.");
      }
      setResult(payload);
      setPhase("");
    } catch (caught) {
      console.error("[upload] Falha ao enviar ou analisar vídeo:", caught);
      const message = caught instanceof Error ? caught.message : "";
      setError(
        /network|failed to fetch|service.*available/i.test(message)
          ? "Não foi possível conectar ao armazenamento. Verifique sua conexão e tente novamente."
          : message || "Não foi possível enviar o vídeo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {isMobile && !previewUrl && !result && !loading ? (
        <MobileCameraCapture onVideo={applyVideo} />
      ) : null}

      <section
        className={`mx-auto max-w-5xl space-y-6 ${
          !previewUrl && !result && !loading ? "hidden md:block" : ""
        }`}
      >
      <header className="text-center">
        <span className="eyebrow">Novo conteúdo</span>
        <h1 className="page-title mt-5">
          Transforme presença
          <br />
          em <span className="text-aura">aura.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
          Envie um vídeo de até 45 segundos. O Gemini analisa execução,
          originalidade, presença e impacto.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="surface p-5 sm:p-7">
          {previewUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                src={previewUrl}
                controls
                playsInline
                className="aspect-[9/12] max-h-[480px] w-full object-contain"
                onLoadedMetadata={(event) => {
                  const nextDuration = event.currentTarget.duration;
                  setDuration(nextDuration);
                  if (nextDuration > MAX_DURATION + 0.25) {
                    setError("O vídeo deve ter no máximo 45 segundos.");
                  }
                }}
              />
              <div className="flex items-center justify-between gap-3 border-t border-white/10 p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{file?.name}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : ""}
                    {duration !== null ? ` · ${duration.toFixed(1)} s` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-button min-h-9 shrink-0 px-3 py-2 text-[10px]"
                  onClick={clearSelection}
                  disabled={loading}
                >
                  Trocar
                </button>
              </div>
            </div>
          ) : (
            <label className="group grid min-h-[260px] cursor-pointer place-items-center rounded-2xl border border-dashed border-white/15 bg-black/30 p-6 text-center transition hover:border-aura/50 hover:bg-aura/[.025]">
              <input
                ref={inputRef}
                className="sr-only"
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/mpeg,video/3gpp"
                onChange={selectVideo}
              />
              <span>
                <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-aura/20 bg-aura/10 text-aura transition group-hover:scale-105">
                  <UploadCloud size={28} />
                </span>
                <strong className="mt-5 block text-xl font-black uppercase tracking-tight">
                  Escolha seu vídeo
                </strong>
                <span className="mt-2 block text-sm text-zinc-500">
                  MP4, MOV ou WebM · 45 s · até 50 MB
                </span>
                <span className="secondary-button mt-6 min-h-10 px-4 py-2">
                  Selecionar arquivo
                </span>
              </span>
            </label>
          )}

          <label className="mt-5 block">
            <span className="section-label">Legenda</span>
            <textarea
              className="input mt-2 min-h-28 resize-none"
              rows={4}
              maxLength={280}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Conte o contexto desse momento..."
            />
            <span className="mt-1 block text-right text-[10px] text-zinc-600">
              {caption.length}/280
            </span>
          </label>

          {error ? (
            <div
              role="alert"
              className="mt-4 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={17} />
              {error}
            </div>
          ) : null}

          <button
            type="button"
            className="primary-button mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void analyze()}
            disabled={loading || !file || (duration ?? 0) > MAX_DURATION}
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                {phase}
              </>
            ) : (
              <>
                <Sparkles size={18} /> Enviar e analisar com IA
              </>
            )}
          </button>
          {loading && progress > 0 && progress < 100 ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-aura transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
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
                  "O arquivo é enviado e confirmado antes da análise.",
                  "O Gemini assiste ao vídeo e avalia quatro critérios.",
                  "O resumo e a aura entram no feed após a aprovação.",
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
            <div className="relative flex min-h-[440px] flex-col items-center justify-center text-center">
              <span className="grid size-10 place-items-center rounded-full bg-aura text-black">
                <Check size={20} strokeWidth={3} />
              </span>
              <div
                className="score-ring mt-5 size-36"
                style={
                  {
                    "--score": `${Math.min(result.totalPoints / 10, 100)}%`,
                  } as React.CSSProperties
                }
              >
                <div className="relative z-10">
                  <strong className="block text-3xl font-black">
                    {result.totalPoints}
                  </strong>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-aura">
                    aura
                  </span>
                </div>
              </div>
              <h2 className="mt-5 text-lg font-black uppercase">
                Análise concluída
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {result.summary}
              </p>
              <p className="mt-3 rounded-xl bg-white/5 p-3 text-left text-xs leading-5 text-zinc-400">
                <strong className="text-aura">Para você: </strong>
                {result.creatorFeedback}
              </p>
              <div className="mt-4 grid w-full grid-cols-2 gap-2 text-left text-[10px]">
                {[
                  ["Presença", result.presence],
                  ["Execução", result.execution],
                  ["Originalidade", result.originality],
                  ["Impacto", result.impact],
                ].map(([label, value]) => (
                  <span key={label} className="rounded-lg bg-black/40 p-2">
                    <span className="text-zinc-500">{label}</span>
                    <strong className="float-right text-aura">+{value}</strong>
                  </span>
                ))}
              </div>
              {result.status === "APPROVED" ? (
                <Link
                  href={`/feed?video=${result.submissionId}`}
                  className="secondary-button mt-5 min-h-10 px-4 py-2"
                >
                  Ver no feed
                </Link>
              ) : (
                <p className="mt-4 text-xs text-amber-300">
                  O vídeo foi enviado para revisão antes de aparecer no feed.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
      </section>
    </>
  );
}
