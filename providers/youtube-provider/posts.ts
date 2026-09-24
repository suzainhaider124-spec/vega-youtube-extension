import { Post, ProviderContext } from "../types";
import { extractVideoId, fetchPipedJson, formatDuration } from "./piped";

export const getPosts = async function ({
  filter,
  page,
  providerValue,
  signal,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  return getSearchPosts({
    searchQuery: "YouTube",
    page,
    providerValue,
    signal,
    providerContext,
  });
};

export const getSearchPosts = async function ({
  searchQuery,
  page,
  providerValue,
  signal,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  if (!searchQuery?.trim()) return [];

  const data = await fetchPipedJson(
    "/search",
    {
      q: searchQuery.trim(),
      filter: "videos",
      page: Math.max(page || 1, 1),
    },
    providerContext,
    signal,
  );

  const items = Array.isArray(data) ? data : data?.items;
  if (!Array.isArray(items)) return [];

  return items
    .map((item: any): Post => {
      const id = item.videoId || item.id || extractVideoId(item.url || "");
      return {
        title: item.title || "Untitled video",
        link: id,
        image: item.thumbnail || item.thumbnailUrl || "",
        provider: providerValue || "youtube-provider",
        tag: item.uploaderName || item.uploader || "YouTube",
        cornerTag: item.duration ? formatDuration(item.duration) : undefined,
      };
    })
    .filter((item: Post) => Boolean(item.link));
};
