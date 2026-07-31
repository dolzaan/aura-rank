import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSettingsForm } from "@/components/profile-settings-form";

export default async function ConfiguracoesPerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/entrar");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      bio: true,
      image: true,
      email: true,
    },
  });
  if (!user?.username) redirect("/onboarding");

  return (
    <main className="mx-auto max-w-2xl pb-28 pt-6 sm:pb-12 sm:pt-10">
      <p className="eyebrow">Configurações</p>
      <h1 className="page-title mt-4">Editar perfil</h1>
      <p className="mt-3 text-sm text-zinc-500">
        Atualize como as pessoas encontram e reconhecem você.
      </p>
      <ProfileSettingsForm
        user={{
          name: user.name || "",
          username: user.username,
          bio: user.bio || "",
          image: user.image,
          email: user.email,
        }}
      />
    </main>
  );
}
