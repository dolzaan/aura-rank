import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function MeuPerfil() {
  const session = await auth();

  if (!session?.user?.username) {
    redirect("/onboarding");
  }

  redirect(`/perfil/${encodeURIComponent(session.user.username)}`);
}
