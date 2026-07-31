"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { BrandMark } from "@/components/brand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "auratok:pwa-install:v1";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

function recentlyDismissed() {
  const value = window.localStorage.getItem(DISMISS_KEY);
  if (!value) return false;
  const timestamp = Number(value);
  return Number.isFinite(timestamp) && Date.now() - timestamp < DISMISS_DURATION;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const timer = window.setTimeout(() => {
      if (isIos) {
        setShowIosHelp(true);
        setVisible(true);
      }
    }, 2400);

    function handleInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleInstalled() {
      setVisible(false);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "dismissed") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setVisible(false);
    setInstallEvent(null);
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Instalar AuraTok"
      className="fixed inset-x-3 bottom-24 z-[65] mx-auto max-w-md rounded-2xl border border-aura/30 bg-[#0b0b0b]/95 p-4 shadow-[0_0_55px_rgba(199,255,50,.16)] backdrop-blur-2xl md:hidden"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-aura text-black">
          <BrandMark className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black">Leve sua aura com você</p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            {showIosHelp
              ? "No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início."
              : "Instale o AuraTok para abrir em tela cheia direto da sua tela inicial."}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Agora não"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="min-h-10 px-3 text-xs font-bold text-zinc-500"
        >
          Agora não
        </button>
        {installEvent ? (
          <button
            type="button"
            onClick={() => void install()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-aura px-4 text-xs font-black text-black"
          >
            <Download size={16} />
            Instalar app
          </button>
        ) : (
          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-bold text-white">
            <Share size={16} className="text-aura" />
            Compartilhar
          </span>
        )}
      </div>
    </aside>
  );
}
