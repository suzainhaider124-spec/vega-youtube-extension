import { Info, ProviderContext } from "../types";

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const id = link.includes("/") ? link.split("/").filter(Boolean).pop() || link : link;
  let title = "YouTube video";
  let image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  let synopsis = "";

  try {
    const response = await providerContext.axios.get(
      `https://pipedapi.kavin.rocks/streams/${encodeURIComponent(id)}`,
    );
    title = response.data?.title || title;
    image = response.data?.thumbnailUrl || image;
    synopsis = response.data?.description || "";
  } catch {
    // Search results and playback remain usable when metadata is unavailable.
  }

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
};
