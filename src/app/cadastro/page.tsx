"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand";

export default function CadastroPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const credentials = {
      name: String(form.get("name") || ""),
      username: String(form.get("username") || "").toLowerCase(),
      email: String(form.get("email") || "").toLowerCase(),
      password: String(form.get("password") || ""),
    };
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });
    if (result?.error) {
      window.location.assign("/entrar");
      return;
    }
    window.location.assign("/feed");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <section className="surface w-full max-w-lg p-6 sm:p-8">
        <Link href="/" aria-label="AuraTok — início">
          <BrandLogo className="text-xl" markClassName="size-8" />
        </Link>
        <p className="eyebrow mt-9">Crie sua identidade</p>
        <h1 className="mt-2 text-3xl font-black">Comece do zero.</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Ninguém mais poderá usar o username que você escolher.
        </p>

        <button
          type="button"
          onClick={() => signIn("google", { redirectTo: "/feed" })}
          className="secondary-button mt-7 flex min-h-12 w-full items-center justify-center gap-3"
        >
          <span className="grid size-6 place-items-center rounded-full bg-white text-xs font-black text-black">
            G
          </span>
          Criar com Google
        </button>

        <div className="my-6 h-px bg-white/10" />
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-zinc-400">
            Nome
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={60}
              className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm outline-none focus:border-aura/60"
            />
          </label>
          <label className="block text-xs font-bold text-zinc-400">
            Username
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                @
              </span>
              <input
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={24}
                pattern="[a-zA-Z0-9._]+"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-black/50 pl-8 pr-4 text-sm lowercase outline-none focus:border-aura/60"
              />
            </div>
          </label>
          <label className="block text-xs font-bold text-zinc-400 sm:col-span-2">
            E-mail
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm outline-none focus:border-aura/60"
            />
          </label>
          <label className="block text-xs font-bold text-zinc-400 sm:col-span-2">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm outline-none focus:border-aura/60"
            />
            <span className="mt-2 block font-normal text-zinc-600">
              Pelo menos 8 caracteres.
            </span>
          </label>
          {error ? (
            <p role="alert" className="text-sm font-semibold text-red-400 sm:col-span-2">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="primary-button flex min-h-12 items-center justify-center gap-2 sm:col-span-2 disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="animate-spin" size={18} /> : null}
            Criar minha conta <ArrowRight size={17} />
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-bold text-aura">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
