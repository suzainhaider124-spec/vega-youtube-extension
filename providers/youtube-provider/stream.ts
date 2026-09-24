import { Stream, ProviderContext } from "../types";

const ENDPOINTS = [
  "https://pipedapi.adminforge.de",
  "https://pipedapi.kavin.rocks",
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
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

  for (const endpoint of ENDPOINTS) {
    try {
      const data = await providerContext.axios.get(
        endpoint.includes("/api/v1")
          ? `${endpoint}/videos/${encodeURIComponent(videoId)}`
          : `${endpoint}/streams/${encodeURIComponent(videoId)}`,
        { signal, timeout: 15000 },
      ).then((response: any) => response.data || {});

      const streams = normalizeStreams(data);
      if (streams.length) return streams;
    } catch {
      // Try the next extractor endpoint.
    }
  }

  return [];
};

function normalizeStreams(data: any): Stream[] {
  const result: Stream[] = [];
  const seen = new Set<string>();
  const add = (url: unknown, type: string, quality: unknown, server: string) => {
    if (typeof url !== "string" || !url.startsWith("http") || seen.has(url)) return;
    seen.add(url);
    result.push({
      server,
      link: url,
      type,
      quality: String(quality || "Auto"),
    });
  };

  add(data.hlsUrl || data.hls, "m3u8", "Auto", "YouTube HLS");

  const sources = [
    ...(Array.isArray(data.videoStreams) ? data.videoStreams : []),
    ...(Array.isArray(data.formatStreams) ? data.formatStreams : []),
    ...(Array.isArray(data.adaptiveFormats) ? data.adaptiveFormats : []),
  ];

  for (const source of sources) {
    const url = source?.url || source?.streamUrl;
    const mime = String(source?.mimeType || source?.mime || source?.type || "").toLowerCase();
    const container = String(source?.container || source?.format || "").toLowerCase();
    const isVideo = mime.includes("video") || source?.quality || source?.qualityLabel || source?.resolution;
    if (!isVideo) continue;
    const isHls = /\.m3u8(?:$|[?&])/i.test(url || "") || mime.includes("mpegurl");
    const isMp4 = /mp4|mpeg-4/.test(`${mime} ${container}`) || /\.mp4(?:$|[?&])/i.test(url || "");
    if (isHls) add(url, "m3u8", source.qualityLabel || source.quality || source.resolution, "YouTube HLS");
    else if (isMp4 || url) add(url, "mp4", source.qualityLabel || source.quality || source.resolution, "YouTube MP4");
  }

  return result;
}

function extractVideoId(value = "") {
  if (!value.includes("/") && !value.includes("?")) return value;
  try {
    const url = new URL(value, "https://www.youtube.com");
    return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return value.replace(/^\/watch\?v=/, "").split("&")[0];
  }
}
