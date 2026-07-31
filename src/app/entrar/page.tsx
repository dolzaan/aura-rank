"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/brand";

export default function EntrarPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      redirect: false,
    });
    if (result?.error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }
    window.location.assign("/feed");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <section className="surface relative w-full max-w-md overflow-hidden p-6 sm:p-8">
        <div className="aura-rings absolute -right-40 -top-44 size-[28rem] opacity-30" />
        <div className="relative">
          <Link href="/" aria-label="AuraTok — início">
            <BrandLogo className="text-xl" markClassName="size-8" />
          </Link>
          <p className="eyebrow mt-10">Entre na sua aura</p>
          <h1 className="mt-2 text-3xl font-black">Bem-vindo de volta.</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Sua identidade protege cada curtida, comentário e vídeo salvo.
          </p>

          <button
            type="button"
            onClick={() => signIn("google", { redirectTo: "/feed" })}
            className="secondary-button mt-7 flex min-h-12 w-full items-center justify-center gap-3"
          >
            <span className="grid size-6 place-items-center rounded-full bg-white text-xs font-black text-black">
              G
            </span>
            Continuar com Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
            <span className="h-px flex-1 bg-white/10" />
            ou use seu e-mail
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-bold text-zinc-400">
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white outline-none transition focus:border-aura/60"
              />
            </label>
            <label className="block text-xs font-bold text-zinc-400">
              Senha
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
                className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white outline-none transition focus:border-aura/60"
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm font-semibold text-red-400">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="primary-button flex min-h-12 w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <LoaderCircle className="animate-spin" size={18} /> : null}
              Entrar <ArrowRight size={17} />
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-zinc-500">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-bold text-aura">
              Criar conta
            </Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-zinc-700">
            <BrandMark className="size-3 text-aura" /> Sua aura é sua identidade
          </div>
        </div>
      </section>
    </main>
  );
}
