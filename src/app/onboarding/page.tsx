"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || ""),
        username: String(form.get("username") || "").toLowerCase(),
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Não foi possível salvar.");
      setLoading(false);
      return;
    }
    await update();
    window.location.assign("/feed");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <section className="surface relative w-full max-w-md overflow-hidden p-6 sm:p-8">
        <div className="aura-rings absolute -right-40 -top-44 size-[28rem] opacity-30" />
        <div className="relative">
          <BrandLogo className="text-xl" markClassName="size-8" />
          <span className="mt-10 grid size-12 place-items-center rounded-2xl bg-aura text-black">
            <Sparkles size={22} />
          </span>
          <h1 className="mt-5 text-3xl font-black">Escolha seu @.</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Esse será seu endereço no AuraTok. Cada username pertence a uma única
            pessoa.
          </p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block text-xs font-bold text-zinc-400">
              Nome exibido
              <input
                name="name"
                defaultValue={session?.user?.name || ""}
                required
                minLength={2}
                maxLength={60}
                className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm outline-none focus:border-aura/60"
              />
            </label>
            <label className="block text-xs font-bold text-zinc-400">
              Username
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-aura">
                  @
                </span>
                <input
                  name="username"
                  autoFocus
                  required
                  minLength={3}
                  maxLength={24}
                  pattern="[a-zA-Z0-9._]+"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-black/50 pl-8 pr-4 text-sm lowercase outline-none focus:border-aura/60"
                />
              </div>
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
              Reservar username
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
