"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export function FollowButton({
  username,
  initialFollowing,
  initialFollowerCount,
}: {
  username: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    const previousFollowing = following;
    const previousCount = count;
    const optimisticFollowing = !following;
    setFollowing(optimisticFollowing);
    setCount((current) => Math.max(0, current + (optimisticFollowing ? 1 : -1)));
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        following?: boolean;
        followerCount?: number;
      };
      if (response.ok) {
        setFollowing(Boolean(payload.following));
        setCount(payload.followerCount ?? previousCount);
      } else {
        setFollowing(previousFollowing);
        setCount(previousCount);
      }
    } catch {
      setFollowing(previousFollowing);
      setCount(previousCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={loading}
      className={following ? "secondary-button min-w-32" : "primary-button min-w-32"}
    >
      {loading ? <LoaderCircle className="animate-spin" size={17} /> : null}
      {following ? "Seguindo" : "Seguir"} · {count}
    </button>
  );
}
