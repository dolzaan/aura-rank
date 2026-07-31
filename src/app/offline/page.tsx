"use client";

import { RotateCw, WifiOff } from "lucide-react";
import { BrandLogo } from "@/components/brand";

export default function Offline() {
  return (
    <section className="grid min-h-[calc(100dvh-12rem)] place-items-center px-4 text-center">
      <div className="max-w-sm">
        <BrandLogo
          className="mx-auto justify-center text-2xl"
          markClassName="size-9"
        />
        <div className="mx-auto mt-10 grid size-20 place-items-center rounded-full border border-aura/30 bg-aura/10 text-aura">
          <WifiOff size={34} />
        </div>
        <h1 className="mt-7 text-3xl font-black uppercase tracking-tight">
          Sua aura está offline.
        </h1>
        <p className="mt-4 leading-7 text-zinc-400">
          Verifique sua conexão. Os vídeos já carregados continuam disponíveis
          enquanto você volta para a rede.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="primary-button mt-8 w-full"
        >
          <RotateCw size={17} />
          Tentar novamente
        </button>
      </div>
    </section>
  );
}
