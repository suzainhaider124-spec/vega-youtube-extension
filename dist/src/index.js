const DEFAULT_API_BASE = "https://pipedapi.kavin.rocks";

class YouTubeVegaProvider {
  constructor(options = {}) {
    this.apiBase = (options.apiBase || DEFAULT_API_BASE).replace(/\/$/, "");
    this.fetch = options.fetch || globalThis.fetch;
    if (typeof this.fetch !== "function") throw new Error("A fetch implementation is required");
  }

  async request(path) {
    const response = await this.fetch(`${this.apiBase}${path}`);
    if (!response.ok) throw new Error(`Piped request failed with HTTP ${response.status}`);
    return response.json();
  }

  async search(query) {
    if (!query || !query.trim()) return [];
    try {
      const data = await this.request(`/search?q=${encodeURIComponent(query.trim())}&filter=videos`);
      const items = Array.isArray(data) ? data : data.items;
      if (!Array.isArray(items)) return [];
      return items.filter((item) => item && (item.url || item.id || item.videoId)).map((item) => {
        const id = this.videoId(item);
        const uploader = item.uploaderName || item.uploader || "YouTube";
        return { id, title: item.title || "Untitled video", poster: item.thumbnail || item.thumbnailUrl || null, type: "movie", description: item.uploaderDescription || `Uploaded by ${uploader}`, uploader };
      }).filter((item) => item.id);
    } catch (error) { console.error("YouTube search error:", error); return []; }
  }

  videoId(item) {
    if (item.videoId) return item.videoId;
    if (item.id && !item.id.includes("/")) return item.id;
    const value = item.url || item.id || "";
    try { const url = new URL(value, "https://www.youtube.com"); return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop(); }
    catch { return value.replace(/^\/watch\?v=/, "").split("&")[0]; }
  }

  async getStreams(videoId) {
    if (!videoId) return [];
    try {
      const data = await this.request(`/streams/${encodeURIComponent(videoId)}`);
      const streams = [], hls = data.hls || data.hlsUrl;
      if (typeof hls === "string" && /\.m3u8(?:$|\?)/i.test(hls)) streams.push({ name: "HLS Stream", url: hls, quality: "Auto", type: "hls" });
      for (const stream of Array.isArray(data.videoStreams) ? data.videoStreams : []) {
        const mimeType = stream.mimeType || stream.mime || "";
        const isMp4 = stream.format === "MPEG-4" || /video\/mp4/i.test(mimeType) || /\.mp4(?:$|\?)/i.test(stream.url || "");
        if (isMp4 && stream.url) streams.push({ name: `Direct MP4 (${stream.quality || stream.videoOnly ? "Available" : "Auto"})`, url: stream.url, quality: stream.quality || null, type: "mp4" });
      }
      return streams;
    } catch (error) { console.error("YouTube stream error:", error); return []; }
  }

  async streams(videoId) { return this.getStreams(videoId); }
}

export default YouTubeVegaProvider;
