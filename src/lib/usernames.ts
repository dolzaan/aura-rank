import { z } from "zod";

const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "auratok",
  "cadastro",
  "configuracoes",
  "entrar",
  "feed",
  "ligas",
  "onboarding",
  "perfil",
  "ranking",
  "suporte",
  "upload",
]);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use pelo menos 3 caracteres.")
  .max(24, "Use no máximo 24 caracteres.")
  .regex(
    /^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$/,
    "Use letras minúsculas, números, ponto ou sublinhado.",
  )
  .refine((value) => !value.includes("..") && !value.includes("__"), {
    message: "Evite pontuação repetida.",
  })
  .refine((value) => !RESERVED_USERNAMES.has(value), {
    message: "Esse username é reservado.",
  });

export function normalizeUsername(value: string) {
  return usernameSchema.parse(value);
}
