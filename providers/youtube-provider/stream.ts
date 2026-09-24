import { Stream, ProviderContext } from "../types";
import { extractVideoId, fetchPipedJson } from "./piped";

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
  const videoId = extractVideoId(link || "");
  if (!videoId) return [];

  const data = await fetchPipedJson(`/streams/${encodeURIComponent(videoId)}`, {}, providerContext, signal);
  const streams: Stream[] = [];
  const hls = data?.hls || data?.hlsUrl;

  if (typeof hls === "string" && /\.m3u8(?:$|\?)/i.test(hls)) {
    streams.push({ server: "Piped HLS", link: hls, type: "m3u8", quality: "Auto" });
  }

  for (const source of Array.isArray(data?.videoStreams) ? data.videoStreams : []) {
    const mime = source.mimeType || source.mime || "";
    const isMp4 = source.format === "MPEG-4" || /video\/mp4/i.test(mime) || /\.mp4(?:$|\?)/i.test(source.url || "");
    if (isMp4 && source.url) {
      streams.push({
        server: "Piped MP4",
        link: source.url,
        type: "mp4",
        quality: source.quality || "Auto",
      });
    }
  }

  return streams;
};
