import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "video/mp4",
          "video/quicktime",
          "video/webm",
          "video/mpeg",
          "video/3gpp",
        ],
        maximumSizeInBytes: MAX_VIDEO_SIZE,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // O registro é criado somente depois que o Gemini conclui a análise.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Falha ao autorizar upload:", error);
    return NextResponse.json(
      { error: "Não foi possível iniciar o envio do vídeo." },
      { status: 400 },
    );
  }
}
