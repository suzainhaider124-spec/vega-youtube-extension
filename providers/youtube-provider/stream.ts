import { Stream, ProviderContext } from "../types";

const INSTANCES = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://yt.chocolatemoo53.com",
  "https://invidious.tiekoetter.com",
  "https://invidious.f5.si",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.kavin.rocks",
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

  // Invidious can proxy a selected YouTube format directly. This is useful
  // when /api/v1/videos returns metadata but omits formatStreams.
  for (const instance of INSTANCES.slice(0, 5)) {
    const direct = await probeDirect(instance, videoId, signal, providerContext);
    if (direct) return [direct];
  }

  for (const instance of INSTANCES) {
    try {
      const url = instance.startsWith("https://pipedapi")
        ? `${instance}/streams/${encodeURIComponent(videoId)}`
        : `${instance}/api/v1/videos/${encodeURIComponent(videoId)}`;
      const response = await providerContext.axios.get(url, { signal, timeout: 15000 });
      const streams = normalize(response.data || {});
      if (streams.length) return streams;
    } catch {
      // Try the next public extractor.
    }
  }

  return [];
};

async function probeDirect(
  instance: string,
  videoId: string,
  signal: AbortSignal | undefined,
  providerContext: ProviderContext,
): Promise<Stream | null> {
  // itag 18 is the broadly supported 360p progressive MP4 format; itag 22
  // is a higher-quality fallback on videos where it is available.
  for (const itag of [18, 22]) {
    const url = `${instance}/latest_version/${encodeURIComponent(videoId)}?itag=${itag}`;
    try {
      const response = await providerContext.axios.head(url, { signal, timeout: 10000, maxRedirects: 5 });
      if (response.status >= 200 && response.status < 400) {
        return { server: `Invidious MP4 ${itag}`, link: url, type: "mp4", quality: itag === 22 ? "720p" : "360p" };
      }
    } catch {
      // Some mobile HTTP clients do not support HEAD; still try GET headers.
      try {
        const response = await providerContext.axios.get(url, {
          signal,
          timeout: 10000,
          maxRedirects: 5,
          responseType: "stream",
        });
        if (response.status >= 200 && response.status < 400) {
          return { server: `Invidious MP4 ${itag}`, link: url, type: "mp4", quality: itag === 22 ? "720p" : "360p" };
        }
      } catch {
        // Try the next format/instance.
      }
    }
  }
  return null;
}

function normalize(data: any): Stream[] {
  const result: Stream[] = [];
  const seen = new Set<string>();
  const add = (url: unknown, type: string, quality: unknown, server: string) => {
    if (typeof url !== "string" || !/^https?:\/\//i.test(url) || seen.has(url)) return;
    seen.add(url);
    result.push({ server, link: url, type, quality: String(quality || "Auto") });
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
    const isVideo = mime.includes("video") || source?.quality || source?.qualityLabel || source?.resolution;
    if (!isVideo || !url) continue;
    const isHls = /\.m3u8(?:$|[?&])/i.test(url) || mime.includes("mpegurl");
    const isMp4 = /mp4|mpeg-4/.test(`${mime} ${source?.container || source?.format || ""}`) || /\.mp4(?:$|[?&])/i.test(url);
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
