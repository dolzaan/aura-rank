import { NextResponse } from "next/server";
import { z } from "zod";
import { get } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 300;

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const GEMINI_API = "https://generativelanguage.googleapis.com";

const requestSchema = z.object({
  videoUrl: z.url(),
  caption: z.string().trim().max(280).optional(),
  mimeType: z.string().regex(/^video\//),
  fileName: z.string().trim().min(1).max(180),
});

const geminiAnalysisSchema = z.object({
  confidence: z.number().int().min(0).max(100),
  presence: z.number().int().min(0).max(250),
  execution: z.number().int().min(0).max(250),
  originality: z.number().int().min(0).max(250),
  impact: z.number().int().min(0).max(250),
  summary: z.string().trim().min(20).max(320),
  creatorFeedback: z.string().trim().min(20).max(420),
  publicCaption: z.string().trim().min(15).max(240),
  mainMoment: z.string().trim().min(2).max(20),
  strengths: z.array(z.string().trim().min(2).max(80)).min(1).max(3),
  contentSafe: z.boolean(),
  suspectedReupload: z.boolean(),
  reviewRequired: z.boolean(),
});

type GeminiFile = {
  name: string;
  uri: string;
  mimeType: string;
  state?: "PROCESSING" | "ACTIVE" | "FAILED";
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    confidence: { type: "INTEGER" },
    presence: { type: "INTEGER" },
    execution: { type: "INTEGER" },
    originality: { type: "INTEGER" },
    impact: { type: "INTEGER" },
    summary: { type: "STRING" },
    creatorFeedback: { type: "STRING" },
    publicCaption: { type: "STRING" },
    mainMoment: { type: "STRING" },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    contentSafe: { type: "BOOLEAN" },
    suspectedReupload: { type: "BOOLEAN" },
    reviewRequired: { type: "BOOLEAN" },
  },
  required: [
    "confidence",
    "presence",
    "execution",
    "originality",
    "impact",
    "summary",
    "creatorFeedback",
    "publicCaption",
    "mainMoment",
    "strengths",
    "contentSafe",
    "suspectedReupload",
    "reviewRequired",
  ],
};

function apiUrl(path: string, apiKey: string) {
  return `${GEMINI_API}${path}${path.includes("?") ? "&" : "?"}key=${encodeURIComponent(apiKey)}`;
}

async function uploadToGemini(
  bytes: ArrayBuffer,
  mimeType: string,
  fileName: string,
  apiKey: string,
) {
  const start = await fetch(apiUrl("/upload/v1beta/files", apiKey), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(bytes.byteLength),
      "X-Goog-Upload-Header-Content-Type": mimeType,
    },
    body: JSON.stringify({ file: { display_name: fileName } }),
  });

  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!start.ok || !uploadUrl) {
    throw new Error(`Gemini recusou o início do upload (${start.status}).`);
  }

  const finish = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(bytes.byteLength),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: bytes,
  });

  if (!finish.ok) {
    throw new Error(`Gemini recusou o vídeo (${finish.status}).`);
  }

  const payload = (await finish.json()) as { file: GeminiFile };
  return payload.file;
}

async function waitUntilActive(file: GeminiFile, apiKey: string) {
  let current = file;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (current.state === "ACTIVE" || !current.state) return current;
    if (current.state === "FAILED") {
      throw new Error("O Gemini não conseguiu processar este vídeo.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch(apiUrl(`/v1beta/${current.name}`, apiKey), {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Falha ao consultar o vídeo no Gemini (${response.status}).`);
    }
    current = (await response.json()) as GeminiFile;
  }
  throw new Error("A análise do vídeo demorou mais do que o esperado.");
}

async function analyzeWithGemini(
  file: GeminiFile,
  caption: string | undefined,
  apiKey: string,
  modelName: string,
) {
  const model = modelName.replace(/^models\//, "");
  const prompt = `Analise o vídeo como curador do AuraTok. A pontuação deve refletir SOMENTE o que é visível e audível no vídeo, sem usar valores fixos.

Avalie cada eixo entre 0 e 250:
- presence: confiança, postura e domínio da cena;
- execution: dificuldade, controle e qualidade da realização;
- originality: criatividade e imprevisibilidade;
- impact: força do momento e potencial de reação.

Produza em português do Brasil:
- summary: resumo factual do que realmente acontece;
- creatorFeedback: retorno útil e específico para quem publicou;
- publicCaption: explicação curta e interessante que ficará visível no feed;
- mainMoment: timestamp aproximado do ponto principal;
- strengths: de 1 a 3 qualidades concretas.

Se não houver material suficiente para avaliar, use notas baixas e confiança baixa. Marque reviewRequired quando houver dúvida de segurança, conteúdo impróprio ou provável reenvio. Legenda informada pelo usuário: ${caption || "(sem legenda)"}.`;

  const response = await fetch(
    apiUrl(`/v1beta/models/${encodeURIComponent(model)}:generateContent`, apiKey),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                file_data: {
                  mime_type: file.mimeType,
                  file_uri: file.uri,
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          response_mime_type: "application/json",
          response_schema: responseSchema,
        },
      }),
    },
  );

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini falhou (${response.status}).`);
  }

  const text = payload.candidates?.[0]?.content?.parts?.find(
    (part) => part.text,
  )?.text;
  if (!text) throw new Error("O Gemini não devolveu uma análise.");

  return geminiAnalysisSchema.parse(JSON.parse(text));
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Entre para publicar." }, { status: 401 });
    }
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Os dados do vídeo são inválidos." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;
    if (!apiKey || !model) {
      return NextResponse.json(
        { error: "A análise por IA ainda não está configurada no servidor." },
        { status: 503 },
      );
    }

    const videoUrl = new URL(parsed.data.videoUrl);
    if (!videoUrl.hostname.endsWith(".blob.vercel-storage.com")) {
      return NextResponse.json(
        { error: "O vídeo precisa ser enviado pelo AuraTok antes da análise." },
        { status: 400 },
      );
    }

    const source = await get(videoUrl.toString(), { access: "private" });
    if (!source || source.statusCode !== 200) {
      throw new Error("Não foi possível recuperar o vídeo enviado.");
    }
    const bytes = await new Response(source.stream).arrayBuffer();
    if (bytes.byteLength > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "O vídeo ultrapassa o limite de 50 MB." },
        { status: 413 },
      );
    }

    const uploadedFile = await uploadToGemini(
      bytes,
      parsed.data.mimeType,
      parsed.data.fileName,
      apiKey,
    );
    const activeFile = await waitUntilActive(uploadedFile, apiKey);
    const analysis = await analyzeWithGemini(
      activeFile,
      parsed.data.caption,
      apiKey,
      model,
    );
    const totalPoints =
      analysis.presence +
      analysis.execution +
      analysis.originality +
      analysis.impact;
    const status =
      analysis.contentSafe && !analysis.reviewRequired ? "APPROVED" : "REVIEW";

    const submission = await prisma.$transaction(async (database) => {
      const created = await database.videoSubmission.create({
        data: {
          userId: session.user.id,
          videoUrl: parsed.data.videoUrl,
          caption: parsed.data.caption,
          status,
          totalPoints,
          analysis: { ...analysis, totalPoints },
        },
      });
      if (status === "APPROVED") {
        await database.auraTransaction.create({
          data: {
            userId: session.user.id,
            submissionId: created.id,
            amount: totalPoints,
            reason: "Análise do vídeo pelo Gemini",
          },
        });
        await database.user.update({
          where: { id: session.user.id },
          data: { auraBalance: { increment: totalPoints } },
        });
      }
      return created;
    });

    return NextResponse.json({
      submissionId: submission.id,
      totalPoints,
      status,
      ...analysis,
    });
  } catch (error) {
    console.error("Falha na análise do vídeo:", error);
    const message =
      error instanceof z.ZodError
        ? "A IA devolveu uma análise incompleta. Tente novamente."
        : error instanceof Error
          ? error.message
          : "Não foi possível analisar o vídeo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
