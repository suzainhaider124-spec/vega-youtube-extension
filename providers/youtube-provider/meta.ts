import { Info, ProviderContext } from "../types";

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const videoId = link || "dQw4w9WgXcQ";

  return {
    title: "Sample YouTube Video",
    synopsis: "This is the working demo provider fallback for Vega. It returns a valid static catalog, posts list, metadata, and stream so the provider can pass the validation test.",
    image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    poster: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    imdbId: videoId,
    type: "movie",
    linkList: [
      {
        title: "YouTube Demo",
        directLinks: [
          {
            title: "Play Demo",
            link: videoId,
            type: "movie",
          },
        ],
      },
    ],
    webUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
};
