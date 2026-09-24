import { Post, ProviderContext } from "../types";

const INVIDIOUS_INSTANCES = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://yt.chocolatemoo53.com",
  "https://invidious.tiekoetter.com",
  "https://invidious.f5.si",
];

export const getPosts = async function ({
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
    searchQuery: "latest YouTube videos",
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
  const query = searchQuery?.trim();
  if (!query) return [];

  let lastError: unknown;
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await providerContext.axios.get(`${instance}/api/v1/search`, {
        params: { q: query, type: "video", page: Math.max(page || 1, 1) },
        signal,
        timeout: 15000,
      });
      const items = Array.isArray(response.data) ? response.data : [];
      const posts = items
        .filter((item: any) => item?.type === "video" && item.videoId)
        .map((item: any): Post => ({
          title: item.title || "Untitled video",
          link: item.videoId,
          image: item.videoThumbnails?.find((thumbnail: any) => thumbnail.quality === "medium")?.url ||
            item.videoThumbnails?.[0]?.url ||
            `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
          provider: providerValue || "youtube-provider",
          tag: item.author || "YouTube",
          cornerTag: item.lengthSeconds ? formatDuration(item.lengthSeconds) : undefined,
        }));
      if (posts.length > 0) return posts;
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("All Invidious search instances failed", lastError);
  return [];
};

function formatDuration(seconds: number | string) {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return undefined;
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}
