import { Trophy, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function Ligas() {
  const session = await auth();
  const memberships = await prisma.leagueMember.findMany({
    where: { userId: session!.user.id },
    include: { league: { include: { _count: { select: { members: true } } } } },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <main className="space-y-10 pb-28 pt-6 sm:pb-12 sm:pt-10">
      <section>
        <p className="eyebrow">Compita junto</p>
        <h1 className="page-title mt-3">Suas ligas</h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Nenhuma liga, convite ou pontuação é criada artificialmente.
        </p>
      </section>

      {memberships.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {memberships.map(({ league, role }) => (
            <article key={league.id} className="surface p-6 sm:p-8">
              <div className="grid size-12 place-items-center rounded-2xl bg-aura text-black">
                <Trophy size={22} />
              </div>
              <h2 className="mt-7 text-2xl font-bold">{league.name}</h2>
              <p className="mt-2 text-sm text-zinc-500">{league.description}</p>
              <div className="mt-5 flex items-center gap-2 text-sm text-zinc-400">
                <Users size={15} /> {league._count.members} participantes · {role.toLowerCase()}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="surface grid min-h-72 place-items-center p-8 text-center">
          <div>
            <Trophy className="mx-auto text-aura" size={34} />
            <h2 className="mt-5 text-xl font-black">Nenhuma liga ainda</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Quando você criar ou aceitar um convite real, a liga aparecerá aqui.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
