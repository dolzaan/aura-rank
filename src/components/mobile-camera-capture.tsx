"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  FlipHorizontal2,
  Images,
  LoaderCircle,
} from "lucide-react";
import { clsx } from "clsx";

const MAX_RECORDING_SECONDS = 45;
const RECORDING_MIME_TYPES = [
  "video/mp4;codecs=h264,aac",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/mp4",
  "video/webm",
];

function recordingMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return (
    RECORDING_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ||
    ""
  );
}

function formatTimer(seconds: number) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

export function MobileCameraCapture({
  onVideo,
}: {
  onVideo: (file: File) => void;
}) {
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function openCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Este navegador não oferece acesso direto à câmera. Use a galeria abaixo.",
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1080 },
            height: { ideal: 1920 },
          },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError("");
        setCameraReady(true);
      } catch (caught) {
        if (cancelled) return;
        const errorName = caught instanceof Error ? caught.name : "";
        setCameraError(
          errorName === "NotAllowedError"
            ? "Permita o acesso à câmera e ao microfone para gravar."
            : "Não foi possível abrir a câmera. Você ainda pode usar a galeria.",
        );
        setCameraReady(false);
      }
    }

    void openCamera();
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facingMode]);

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream || !cameraReady || typeof MediaRecorder === "undefined") {
      setCameraError(
        "A gravação não é compatível com este navegador. Use a galeria.",
      );
      return;
    }

    try {
      const mimeType = recordingMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 4_000_000,
            audioBitsPerSecond: 128_000,
          })
        : new MediaRecorder(stream, {
            videoBitsPerSecond: 4_000_000,
            audioBitsPerSecond: 128_000,
          });
      chunksRef.current = [];
      elapsedRef.current = 0;
      setSeconds(0);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setRecording(false);
        const baseType = (recorder.mimeType || mimeType || "video/webm").split(
          ";",
        )[0];
        const extension = baseType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunksRef.current, { type: baseType });
        if (blob.size === 0) {
          setCameraError("A gravação ficou vazia. Tente novamente.");
          return;
        }
        onVideo(
          new File([blob], `auratok-${Date.now()}.${extension}`, {
            type: baseType,
            lastModified: Date.now(),
          }),
        );
      };
      recorder.onerror = () => {
        setCameraError("A gravação foi interrompida. Tente novamente.");
        setRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setSeconds(elapsedRef.current);
        if (elapsedRef.current >= MAX_RECORDING_SECONDS) stopRecording();
      }, 1000);
    } catch {
      setCameraError("Não foi possível iniciar a gravação. Use a galeria.");
    }
  }

  function selectFromGallery(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) onVideo(selected);
  }

  return (
    <section className="fixed inset-0 z-[80] overflow-hidden bg-black md:hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={clsx(
          "absolute inset-0 size-full object-cover",
          facingMode === "user" && "-scale-x-100",
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-4 pt-[calc(env(safe-area-inset-top)+.75rem)]">
        <Link
          href="/feed"
          aria-label="Voltar ao feed"
          className="grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md"
        >
          <ChevronLeft size={23} />
        </Link>
        <span
          className={clsx(
            "rounded-full bg-black/45 px-3 py-2 text-xs font-black tabular-nums backdrop-blur-md",
            recording ? "text-red-300" : "text-white",
          )}
        >
          {recording ? `● ${formatTimer(seconds)}` : "Novo vídeo"}
        </span>
        <button
          type="button"
          onClick={() => {
            setCameraReady(false);
            setCameraError("");
            setFacingMode((current) =>
              current === "environment" ? "user" : "environment",
            );
          }}
          disabled={recording}
          aria-label="Alternar câmera"
          className="grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md disabled:opacity-40"
        >
          <FlipHorizontal2 size={20} />
        </button>
      </header>

      {!cameraReady && !cameraError ? (
        <div className="absolute inset-0 grid place-items-center text-aura">
          <LoaderCircle className="animate-spin" size={30} />
        </div>
      ) : null}

      {cameraError ? (
        <div className="absolute inset-x-6 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/75 p-5 text-center backdrop-blur-xl">
          <AlertCircle className="mx-auto text-aura" size={30} />
          <p className="mt-3 text-sm font-semibold leading-6 text-zinc-200">
            {cameraError}
          </p>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-30 grid grid-cols-3 items-end px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="flex justify-center">
          <input
            ref={galleryRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/mpeg,video/3gpp"
            onChange={selectFromGallery}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={recording}
            className="flex flex-col items-center gap-1.5 text-[10px] font-bold text-white disabled:opacity-40"
          >
            <span className="grid size-11 place-items-center rounded-xl border border-white/15 bg-black/55 backdrop-blur-md">
              <Images size={21} />
            </span>
            Galeria
          </button>
        </div>

        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={!cameraReady && !recording}
          aria-label={recording ? "Parar gravação" : "Iniciar gravação"}
          className="mx-auto grid size-20 place-items-center rounded-full border-[5px] border-white shadow-[0_0_0_1px_rgba(0,0,0,.4)] transition active:scale-95 disabled:opacity-40"
        >
          <span
            className={clsx(
              "block bg-red-500 transition-all",
              recording ? "size-8 rounded-lg" : "size-14 rounded-full",
            )}
          />
        </button>

        <div className="flex justify-center">
          <span className="max-w-16 text-center text-[9px] font-semibold leading-4 text-white/65">
            até 45 segundos
          </span>
        </div>
      </div>
    </section>
  );
}
