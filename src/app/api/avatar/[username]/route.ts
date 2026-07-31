import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const { username } = await context.params;
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { image: true },
  });
  if (!user?.image) return new Response(null, { status: 404 });
  if (!user.image.includes(".blob.vercel-storage.com")) {
    return Response.redirect(user.image);
  }
  const result = await get(user.image, {
    access: "private",
    ...(process.env.BLOB_STORE_ID
      ? { storeId: process.env.BLOB_STORE_ID }
      : {}),
  });
  if (!result || result.statusCode !== 200) return new Response(null, { status: 404 });
  const headers = new Headers();
  result.headers.forEach((value, key) => headers.set(key, value));
  headers.set("Cache-Control", "private, max-age=3600");
  return new Response(result.stream, { status: 200, headers });
}
