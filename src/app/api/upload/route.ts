import { issueSignedToken } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const TOKEN_LIFETIME = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadPresignedBody;
    const response = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!pathname.startsWith("videos/") || pathname.includes("..")) {
          throw new Error("Caminho de vídeo inválido.");
        }

        const validUntil = Date.now() + TOKEN_LIFETIME;
        const constraints = {
          allowedContentTypes: ["video/*"],
          maximumSizeInBytes: MAX_VIDEO_SIZE,
          validUntil,
        };
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          ...constraints,
        });

        return {
          token,
          urlOptions: {
            ...constraints,
            addRandomSuffix: true,
          },
        };
      },
      onUploadCompleted: async () => {
        // O registro é criado somente depois que o Gemini conclui a análise.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/upload] Falha ao autorizar upload:", error);
    return NextResponse.json(
      { error: "Não foi possível iniciar o envio do vídeo." },
      { status: 500 },
    );
  }
}
