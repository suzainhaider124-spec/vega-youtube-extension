import { Post, ProviderContext } from "../types";

const DEMO_VIDEO = {
  title: "Sample YouTube Video",
  link: "dQw4w9WgXcQ",
  image: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
};

export const getPosts = async function ({
  filter,
  page,
  providerValue,
  signal,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  return [
    {
      title: DEMO_VIDEO.title,
      link: DEMO_VIDEO.link,
      image: DEMO_VIDEO.image,
      provider: providerValue || "youtube-provider",
      tag: "YouTube Demo",
    },
  ];
};

export const getSearchPosts = async function ({
  searchQuery,
  page,
  providerValue,
  signal,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  return getPosts({
    filter: "latest",
    page,
    providerValue,
    signal,
    providerContext,
  });
};
