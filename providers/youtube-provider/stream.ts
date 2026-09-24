import { Stream, ProviderContext } from "../types";

export const getStream = async function ({
  link,
  type,
  signal,
  providerContext,
  isDownload,
}: {
  link: string;
  type: string;
  signal?: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  return [
    {
      server: "Demo MP4",
      link: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
      type: "mp4",
      quality: "720p",
    },
  ];
};
