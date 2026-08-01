import Link from "next/link";
import { Crown, Medal, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BrandMark } from "@/components/brand";

const medals = ["#C7FF32", "#E4E4E7", "#A77B49"];

export default async function Ranking() {
  const session = await auth();
  const users = await prisma.user.findMany({
    where: { username: { not: null } },
    select: { id: true, username: true, name: true, auraBalance: true, isDemo: true },
    orderBy: [{ auraBalance: "desc" }, { createdAt: "asc" }],
    take: 50,
  });
  const currentIndex = users.findIndex((user) => user.id === session?.user?.id);
  const current = currentIndex >= 0 ? users[currentIndex] : null;

  return (
    <section className="space-y-6">
      <header>
        <span className="eyebrow">Ranking em tempo real</span>
        <h1 className="page-title mt-5">
          Ranking <span className="text-aura">global.</span>
        </h1>
        <p className="mt-4 max-w-xl text-zinc-500">
          Apenas aura realmente conquistada por vídeos publicados.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.45fr]">
        <article className="surface brand-grid relative overflow-hidden p-6 sm:p-8">
          <div className="relative flex items-start justify-between">
            <div>
              <span className="section-label">Sua posição</span>
              <strong className="mt-3 block text-7xl font-black tracking-[-0.08em]">
                {current ? String(currentIndex + 1).padStart(2, "0") : "—"}
                <span className="text-aura">.</span>
              </strong>
            </div>
            <div className="grid size-12 place-items-center rounded-xl bg-aura text-black">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="relative mt-20 flex items-end justify-between gap-4">
            <div>
              <strong className="text-lg">{current?.name || "Seu perfil"}</strong>
              <p className="mt-1 text-sm text-zinc-500">
                {current?.username ? `@${current.username}` : "Complete seu cadastro"}
              </p>
            </div>
            <div className="text-right">
              <strong className="text-2xl font-black text-aura">
                {(current?.auraBalance || 0).toLocaleString("pt-BR")}
              </strong>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                aura total
              </p>
            </div>
          </div>
        </article>

        <div className="surface overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <span className="section-label">Top creators</span>
          </div>
          {users.length ? (
            users.map((user, index) => (
              <Link
                href={`/perfil/${user.username}`}
                key={user.id}
                prefetch={false}
                className="grid grid-cols-[42px_1fr_auto] items-center gap-3 border-b border-white/[.07] px-4 py-4 transition last:border-b-0 hover:bg-white/[.025] sm:grid-cols-[56px_1fr_auto] sm:px-6 sm:py-5"
              >
                <div className="relative grid size-10 place-items-center rounded-xl bg-white/[.04] sm:size-12">
                  {index === 0 ? (
                    <Crown size={20} style={{ color: medals[0] }} />
                  ) : (
                    <Medal size={19} style={{ color: medals[index] || "#71717a" }} />
                  )}
                  <span className="absolute -left-1 -top-1 grid size-5 place-items-center rounded-md bg-[#1a1a1a] text-[9px] font-black">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <strong className="block truncate text-sm sm:text-base">
                    {user.name || user.username}
                  </strong>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                    @{user.username}
                    {user.isDemo ? <span>· demonstração</span> : null}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <strong className="text-sm font-black tabular-nums sm:text-lg">
                    {user.auraBalance.toLocaleString("pt-BR")}
                  </strong>
                  <BrandMark className="hidden size-4 text-aura sm:block" />
                </div>
              </Link>
            ))
          ) : (
            <p className="p-8 text-center text-sm text-zinc-500">
              O ranking começa com a primeira publicação.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
