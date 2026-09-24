import { Stream, ProviderContext } from "../types";

const INVIDIOUS_INSTANCES = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://yt.chocolatemoo53.com",
  "https://invidious.tiekoetter.com",
  "https://invidious.f5.si",
];

export const getStream = async function ({
  link,
  signal,
  providerContext,
}: {
  link: string;
  type: string;
  signal?: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  const videoId = extractVideoId(link);
  if (!videoId) return [];

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await providerContext.axios.get(`${instance}/api/v1/videos/${encodeURIComponent(videoId)}`, { signal, timeout: 15000 });
      const data = response.data || {};
      const streams: Stream[] = [];
      if (data.hlsUrl) streams.push({ server: "Invidious HLS", link: data.hlsUrl, type: "m3u8", quality: "Auto" });

      for (const source of Array.isArray(data.formatStreams) ? data.formatStreams : []) {
        if (source.url && (source.type || "").toLowerCase().includes("video/mp4")) {
          streams.push({ server: "Invidious MP4", link: source.url, type: "mp4", quality: source.qualityLabel || source.quality || "Auto" });
        }
      }
      if (streams.length > 0) return streams;
    } catch {
      // Try the next public instance.
    }
  }
  return [];
};

function extractVideoId(value = "") {
  if (!value.includes("/") && !value.includes("?")) return value;
  try {
    const url = new URL(value, "https://www.youtube.com");
    return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return value.replace(/^\/watch\?v=/, "").split("&")[0];
  }
}
