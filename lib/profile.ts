import type { Reply, Tweet } from "@/lib/tweets";

export type HoverProfile = {
  name: string;
  username: string;
  profilePicture?: string | null;
  description?: string | null;
  followers?: number | null;
  following?: number | null;
  verified?: boolean;
};

/**
 * Builds a hover profile from a tweet or reply row; the bio and counts live in
 * the author blob. Kept out of the hover card itself so server components can
 * call it -- a "use client" module only exports components to the server.
 */
export function tweetProfile(tweet: Tweet | Reply): HoverProfile {
  return {
    name: tweet.author_name,
    username: tweet.author_username,
    profilePicture: tweet.author_profile_picture,
    description: tweet.author?.description ?? null,
    followers: tweet.author?.followers ?? null,
    following: tweet.author?.following ?? null,
    verified: tweet.author_is_verified || tweet.author_is_blue_verified,
  };
}
