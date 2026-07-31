import { issueSignedToken } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const TOKEN_LIFETIME = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Entre para enviar arquivos." },
        { status: 401 },
      );
    }
    const body = (await request.json()) as HandleUploadPresignedBody;
    const response = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        const isVideo = pathname.startsWith(`videos/${session.user.id}/`);
        const isAvatar = pathname.startsWith(`avatars/${session.user.id}/`);
        if ((!isVideo && !isAvatar) || pathname.includes("..")) {
          throw new Error("Caminho de arquivo inválido.");
        }

        const validUntil = Date.now() + TOKEN_LIFETIME;
        const constraints = {
          allowedContentTypes: isVideo
            ? ["video/*"]
            : ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: isVideo ? MAX_VIDEO_SIZE : MAX_AVATAR_SIZE,
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
      { error: "Não foi possível iniciar o envio do arquivo." },
      { status: 500 },
    );
  }
}
