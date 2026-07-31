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
  let video = await prisma.videoSubmission.findUnique({
    where: { id: videoId },
  });

  const demo = demos[videoId as keyof typeof demos];
  if (!video && !demo) return null;

  if (!video && demo) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        name: demo.name,
        username: demo.username,
      },
    });
    video = await prisma.videoSubmission.create({
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

  if (videoId === "demo-skate-dolzaan") {
    const nina = await prisma.user.upsert({
      where: { email: "nina@auratok.app" },
      update: {},
      create: { email: "nina@auratok.app", name: "Nina Costa", username: "nina" },
    });
    const mari = await prisma.user.upsert({
      where: { email: "mari@auratok.app" },
      update: {},
      create: { email: "mari@auratok.app", name: "Mari Alves", username: "mari" },
    });
    await prisma.comment.upsert({
      where: { id: "demo-comment-skate-nina" },
      update: {},
      create: {
        id: "demo-comment-skate-nina",
        videoId,
        userId: nina.id,
        body: "Isso foi muito aura 🔥",
      },
    });
    await prisma.comment.upsert({
      where: { id: "demo-comment-skate-mari" },
      update: {},
      create: {
        id: "demo-comment-skate-mari",
        videoId,
        userId: mari.id,
        body: "A saída sem olhar ganhou tudo.",
      },
    });
  }

  return video;
}
