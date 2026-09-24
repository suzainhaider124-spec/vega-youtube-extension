const API_BASE = "https://pipedapi.kavin.rocks";

async function getSearchPosts({ searchQuery, page = 1, signal, providerContext }) {
  if (!searchQuery || !searchQuery.trim()) return [];
  const response = await providerContext.axios.get(`${API_BASE}/search`, {
    params: { q: searchQuery.trim(), filter: "videos", page: Math.max(page, 1) },
    signal,
  });
  const items = Array.isArray(response.data) ? response.data : response.data && response.data.items;
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const link = item.videoId || item.id || extractVideoId(item.url);
    return {
      title: item.title || "Untitled video",
      link,
      image: item.thumbnail || item.thumbnailUrl || "",
      provider: "youtube-provider",
      tag: item.uploaderName || item.uploader || "YouTube",
    };
  }).filter((item) => item.link);
}

async function getPosts(args) {
  return getSearchPosts({ ...args, searchQuery: "YouTube" });
}

function extractVideoId(value = "") {
  try {
    const url = new URL(value, "https://www.youtube.com");
    return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return value.replace(/^\/watch\?v=/, "").split("&")[0];
  }
}

exports.getPosts = getPosts;
exports.getSearchPosts = getSearchPosts;
