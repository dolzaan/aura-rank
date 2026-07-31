"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { uploadPresigned } from "@vercel/blob/client";
import { Camera, LoaderCircle, LogOut, Save, Trash2 } from "lucide-react";

type ProfileUser = {
  name: string;
  username: string;
  bio: string;
  image: string | null;
  email: string;
};

export function ProfileSettingsForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.image ? `/api/avatar/${encodeURIComponent(user.username)}` : null,
  );
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (avatarFile && avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    },
    [avatarFile, avatarPreview],
  );

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A foto deve ter no máximo 5 MB.");
      return;
    }
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.user?.id) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const form = new FormData(event.currentTarget);
      let image: string | null | undefined = removeAvatar ? null : undefined;
      if (avatarFile) {
        const blob = await uploadPresigned(
          `avatars/${session.user.id}/${avatarFile.name}`,
          avatarFile,
          {
            access: "private",
            handleUploadUrl: "/api/upload",
          },
        );
        image = blob.url;
      }
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          username: String(form.get("username") || "").toLowerCase(),
          bio: String(form.get("bio") || ""),
          image,
        }),
      });
      const payload = (await response.json()) as {
        user?: { username: string };
        error?: string;
      };
      if (!response.ok || !payload.user) {
        throw new Error(payload.error || "Não foi possível salvar.");
      }
      await update();
      setSuccess("Perfil atualizado.");
      router.replace(`/perfil/${payload.user.username}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="surface mt-7 space-y-6 p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-full border border-aura/30 bg-zinc-950 text-2xl font-black"
          aria-label="Trocar foto de perfil"
        >
          {avatarPreview && !removeAvatar ? (
            <Image src={avatarPreview} alt="" fill sizes="112px" className="object-cover" unoptimized />
          ) : (
            user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition group-hover:opacity-100">
            <Camera size={24} />
          </span>
        </button>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selectAvatar}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="secondary-button min-h-10 px-4"
          >
            <Camera size={16} /> Escolher foto
          </button>
          {user.image || avatarFile ? (
            <button
              type="button"
              onClick={() => {
                setAvatarFile(null);
                setAvatarPreview(null);
                setRemoveAvatar(true);
              }}
              className="ml-2 inline-flex min-h-10 items-center gap-2 px-3 text-xs font-bold text-red-400"
            >
              <Trash2 size={15} /> Remover
            </button>
          ) : null}
          <p className="mt-2 text-xs text-zinc-600">JPG, PNG ou WebP · até 5 MB</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-bold text-zinc-400">
          Nome
          <input
            name="name"
            defaultValue={user.name}
            required
            minLength={2}
            maxLength={60}
            className="input mt-2"
          />
        </label>
        <label className="text-xs font-bold text-zinc-400">
          Username
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-aura">@</span>
            <input
              name="username"
              defaultValue={user.username}
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9._]+"
              className="input pl-8 lowercase"
            />
          </div>
        </label>
      </div>
      <label className="block text-xs font-bold text-zinc-400">
        Biografia
        <textarea
          name="bio"
          defaultValue={user.bio}
          rows={4}
          maxLength={160}
          className="input mt-2 resize-none"
          placeholder="Conte quem você é em até 160 caracteres."
        />
      </label>
      <label className="block text-xs font-bold text-zinc-500">
        E-mail
        <input value={user.email} disabled className="input mt-2 opacity-50" />
      </label>

      {error ? <p role="alert" className="text-sm font-semibold text-red-400">{error}</p> : null}
      {success ? <p role="status" className="text-sm font-semibold text-aura">{success}</p> : null}

      <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => signOut({ redirectTo: "/entrar" })}
          className="secondary-button min-h-11 px-4 text-red-300"
        >
          <LogOut size={17} /> Sair da conta
        </button>
        <button type="submit" disabled={loading} className="primary-button min-h-11 px-5 disabled:opacity-60">
          {loading ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
          Salvar alterações
        </button>
      </div>
    </form>
  );
}
