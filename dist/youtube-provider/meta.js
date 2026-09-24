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

exports.getMeta = getMeta;
