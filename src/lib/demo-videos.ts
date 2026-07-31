import { prisma } from "@/lib/prisma";

const demos = {
  "demo-skate-dolzaan": {
    email: "creator@auratok.app",
    name: "Paulo Dolzan",
    username: "dolzaan",
    videoUrl: "/auratok-skate-hero.png",
    caption: "Cheguei atrasado, sentei e agi como se nada tivesse acontecido.",
    totalPoints: 847,
    summary:
      "A entrada segura e a finalização sem hesitar sustentam o impacto da cena.",
  },
  "demo-basket-nina": {
    email: "nina@auratok.app",
    name: "Nina Costa",
    username: "nina",
    videoUrl: "/demo-basket",
    caption: "Acertou a cesta de costas e saiu sem olhar.",
    totalPoints: 1320,
    summary:
      "A cesta de costas combina dificuldade, precisão e uma saída que amplifica o momento.",
  },
} as const;

export async function ensureVideo(videoId: string) {
  const existing = await prisma.videoSubmission.findUnique({
    where: { id: videoId },
  });
  if (existing) return existing;

  const demo = demos[videoId as keyof typeof demos];
  if (!demo) return null;

  const user = await prisma.user.upsert({
    where: { email: demo.email },
    update: {},
    create: {
      email: demo.email,
      name: demo.name,
      username: demo.username,
    },
  });

  return prisma.videoSubmission.create({
    data: {
      id: videoId,
      userId: user.id,
      videoUrl: demo.videoUrl,
      caption: demo.caption,
      totalPoints: demo.totalPoints,
      status: "APPROVED",
      analysis: { publicCaption: demo.summary, summary: demo.summary },
    },
  });
}
