import { get } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ videoId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return new Response(null, { status: 401 });
  const { videoId } = await context.params;
  const video = await prisma.videoSubmission.findUnique({
    where: { id: videoId },
    select: { videoUrl: true, status: true },
  });
  if (!video || video.status !== "APPROVED") {
    return new Response(null, { status: 404 });
  }
  if (!video.videoUrl.includes(".private.blob.vercel-storage.com")) {
    return Response.redirect(video.videoUrl);
  }
  const range = request.headers.get("range");
  const result = await get(video.videoUrl, {
    access: "private",
    headers: range ? { Range: range } : undefined,
  });
  if (!result || ![200, 206].includes(result.statusCode)) {
    return new Response(null, { status: 404 });
  }
  const headers = new Headers();
  result.headers.forEach((value, key) => headers.set(key, value));
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, max-age=3600, stale-while-revalidate=86400");
  return new Response(result.stream, { status: result.statusCode, headers });
}
