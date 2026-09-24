import { Info, ProviderContext } from "../types";

const INVIDIOUS_INSTANCES = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://yt.chocolatemoo53.com",
  "https://invidious.tiekoetter.com",
  "https://invidious.f5.si",
];

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const videoId = extractVideoId(link);
  if (!videoId) throw new Error("Missing YouTube video ID");

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await providerContext.axios.get(`${instance}/api/v1/videos/${encodeURIComponent(videoId)}`, { timeout: 15000 });
      const data = response.data || {};
      const image = data.videoThumbnails?.find((thumbnail: any) => thumbnail.quality === "medium")?.url ||
        data.videoThumbnails?.[0]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      return {
        title: data.title || "YouTube video",
        image,
        poster: image,
        synopsis: data.description || `Uploaded by ${data.author || "YouTube"}`,
        imdbId: videoId,
        type: "movie",
        linkList: [{ title: "YouTube", directLinks: [{ title: "Play", link: videoId, type: "movie" }] }],
        webUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch {
      // Try the next public instance.
    }
  }

  const image = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return {
    title: "YouTube video",
    image,
    poster: image,
    synopsis: "YouTube video",
    imdbId: videoId,
    type: "movie",
    linkList: [{ title: "YouTube", directLinks: [{ title: "Play", link: videoId, type: "movie" }] }],
    webUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
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
