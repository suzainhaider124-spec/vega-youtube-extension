const API_BASE = "https://pipedapi.kavin.rocks";
async function getStream({ link, signal, providerContext }) {
  const videoId = link.includes("/") ? extractVideoId(link) : link;
  if (!videoId) return [];
  const data = (await providerContext.axios.get(`${API_BASE}/streams/${encodeURIComponent(videoId)}`, { signal })).data || {};
  const streams = [];
  const hls = data.hls || data.hlsUrl;
  if (typeof hls === "string" && /\.m3u8(?:$|\?)/i.test(hls)) streams.push({ server: "Piped HLS", link: hls, type: "m3u8", quality: "Auto" });
  for (const source of Array.isArray(data.videoStreams) ? data.videoStreams : []) {
    const mime = source.mimeType || source.mime || "";
    if ((source.format === "MPEG-4" || /video\/mp4/i.test(mime) || /\.mp4(?:$|\?)/i.test(source.url || "")) && source.url) streams.push({ server: "Piped MP4", link: source.url, type: "mp4", quality: source.quality || "Auto" });
  }
  return streams;
}
function extractVideoId(value = "") { try { const url = new URL(value, "https://www.youtube.com"); return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || ""; } catch { return value.replace(/^\/watch\?v=/, "").split("&")[0]; } }
export { getStream };
