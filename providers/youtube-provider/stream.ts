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
      const response = await providerContext.axios.get(
        `${instance}/api/v1/videos/${encodeURIComponent(videoId)}`,
        { signal, timeout: 15000 },
      );
      const data = response.data || {};
      const streams: Stream[] = [];

      const hls = data.hlsUrl || data.hls;
      if (typeof hls === "string" && hls.length > 0) {
        streams.push({ server: "Invidious HLS", link: hls, type: "m3u8", quality: "Auto" });
      }

      const sources = [
        ...(Array.isArray(data.formatStreams) ? data.formatStreams : []),
        ...(Array.isArray(data.adaptiveFormats) ? data.adaptiveFormats : []),
        ...(Array.isArray(data.videoStreams) ? data.videoStreams : []),
      ];
      const seen = new Set<string>();

      for (const source of sources) {
        const url = source?.url;
        const mime = String(source?.type || source?.mimeType || source?.mime || "").toLowerCase();
        const isVideo = mime.includes("video/") || mime.includes("video") || source?.qualityLabel || source?.quality;
        const isMp4 = mime.includes("video/mp4") || /\.mp4(?:$|[?&])/i.test(url || "") || source?.container === "mp4" || source?.format === "MPEG-4";
        if (url && isVideo && isMp4 && !seen.has(url)) {
          seen.add(url);
          streams.push({
            server: "Invidious MP4",
            link: url,
            type: "mp4",
            quality: source.qualityLabel || source.quality || source.resolution || "Auto",
          });
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
