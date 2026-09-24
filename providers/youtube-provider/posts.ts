import { Post, ProviderContext } from "../types";

const API_BASE = "https://pipedapi.kavin.rocks";

export const getPosts = async function ({
  page,
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
    providerValue: "youtube-provider",
    signal: new AbortController().signal,
    providerContext,
  });
};

export const getSearchPosts = async function ({
  searchQuery,
  page,
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

  const { axios } = providerContext;
  const response = await axios.get(`${API_BASE}/search`, {
    params: { q: searchQuery.trim(), filter: "videos", page: Math.max(page || 1, 1) },
    signal,
  });
  const items = Array.isArray(response.data) ? response.data : response.data?.items;
  if (!Array.isArray(items)) return [];

  return items
    .map((item: any): Post => {
      const id = item.videoId || item.id || extractVideoId(item.url);
      const uploader = item.uploaderName || item.uploader || "YouTube";
      return {
        title: item.title || "Untitled video",
        link: id,
        image: item.thumbnail || item.thumbnailUrl || "",
        provider: "youtube-provider",
        tag: uploader,
        cornerTag: item.duration ? formatDuration(item.duration) : undefined,
      };
    })
    .filter((item: Post) => Boolean(item.link));
};

function extractVideoId(value = "") {
  try {
    const url = new URL(value, "https://www.youtube.com");
    return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return value.replace(/^\/watch\?v=/, "").split("&")[0];
  }
}

function formatDuration(seconds: number) {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return undefined;
  const minutes = Math.floor(value / 60);
  return `${minutes}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}
