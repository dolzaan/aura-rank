import { VideoFeed } from "@/components/video-feed";

export default async function Feed({
  searchParams,
}: {
  searchParams: Promise<{ video?: string }>;
}) {
  const { video } = await searchParams;
  return <VideoFeed initialVideoId={video?.slice(0, 64)} />;
}
