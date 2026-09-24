import { Info, ProviderContext } from "../types";
import { extractVideoId, fetchPipedJson } from "./piped";

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const id = extractVideoId(link) || link;
  if (!id) {
    throw new Error("Missing video id for YouTube metadata lookup");
  }

  let title = "YouTube video";
  let image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  let synopsis = "";

  try {
    const data = await fetchPipedJson(`/streams/${encodeURIComponent(id)}`, {}, providerContext);
    title = data?.title || title;
    image = data?.thumbnailUrl || image;
    synopsis = data?.description || "";
  } catch {
    // fallback to basic metadata if upstream is unavailable
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
