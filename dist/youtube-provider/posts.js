const API_ENDPOINTS = [
  "https://piped.video",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.kavin.rocks",
];

async function fetchPipedJson(path, params = {}, providerContext, signal) {
  let lastError;
  for (const base of API_ENDPOINTS) {
    try {
      const response = await providerContext.axios.get(`${base}${path}`, {
        params,
        signal,
        timeout: 15000,
      });
      if (response && response.data !== undefined) return response.data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`All Piped endpoints failed for ${path}`);
}

function extractVideoId(value = "") {
  if (!value) return "";
  if (!value.includes("/") && !value.includes("?")) return value;
  try {
    const url = new URL(value, "https://www.youtube.com");
    return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return value.replace(/^\/watch\?v=/, "").split("&")[0];
  }
}

function formatDuration(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const mins = Math.floor(n / 60);
  const secs = Math.floor(n % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

const catalog = [{ title: "YouTube Videos", filter: "youtube" }];
const genres = [];

async function getSearchPosts({ searchQuery, page = 1, signal, providerContext }) {
  if (!searchQuery || !searchQuery.trim()) return [];
  const data = await fetchPipedJson(
    "/search",
    { q: searchQuery.trim(), filter: "videos", page: Math.max(page, 1) },
    providerContext,
    signal,
  );
  const items = Array.isArray(data) ? data : data && data.items;
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const link = item.videoId || item.id || extractVideoId(item.url || "");
      return {
        title: item.title || "Untitled video",
        link,
        image: item.thumbnail || item.thumbnailUrl || "",
        provider: "youtube-provider",
        tag: item.uploaderName || item.uploader || "YouTube",
        cornerTag: item.duration ? formatDuration(item.duration) : undefined,
      };
    })
    .filter((item) => item.link);
}

async function getPosts(args) {
  return getSearchPosts({ ...args, searchQuery: "YouTube" });
}

async function getMeta({ link, providerContext }) {
  const id = extractVideoId(link) || link;
  let title = "YouTube video";
  let image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  let synopsis = "";
  try {
    const data = await fetchPipedJson(`/streams/${encodeURIComponent(id)}`, {}, providerContext);
    title = data?.title || title;
    image = data?.thumbnailUrl || image;
    synopsis = data?.description || "";
  } catch {}
  return {
    title,
    image,
    poster: image,
    synopsis,
    imdbId: id,
    type: "movie",
    linkList: [{ title: "YouTube", directLinks: [{ title, link: id, type: "movie" }] }],
    webUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

async function getStream({ link, signal, providerContext }) {
  const videoId = extractVideoId(link || "");
  if (!videoId) return [];
  const data = await fetchPipedJson(`/streams/${encodeURIComponent(videoId)}`, {}, providerContext, signal);
  const streams = [];
  const hls = data?.hls || data?.hlsUrl;
  if (typeof hls === "string" && /\.m3u8(?:$|\?)/i.test(hls)) {
    streams.push({ server: "Piped HLS", link: hls, type: "m3u8", quality: "Auto" });
  }
  for (const source of Array.isArray(data?.videoStreams) ? data.videoStreams : []) {
    const mime = source.mimeType || source.mime || "";
    const isMp4 = source.format === "MPEG-4" || /video\/mp4/i.test(mime) || /\.mp4(?:$|\?)/i.test(source.url || "");
    if (isMp4 && source.url) {
      streams.push({ server: "Piped MP4", link: source.url, type: "mp4", quality: source.quality || "Auto" });
    }
  }
  return streams;
}

exports.catalog = catalog;
exports.genres = genres;
exports.getPosts = getPosts;
exports.getSearchPosts = getSearchPosts;
exports.getMeta = getMeta;
exports.getStream = getStream;
