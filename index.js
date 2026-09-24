class YouTubeVegaProvider {
  constructor() {
    this.apiBase = "https://pipedapi.kavin.rocks"; 
  }

  async search(query) {
    try {
      const response = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(query)}&filter=videos`);
      const data = await response.json();

      return data.items.map((item) => ({
        id: item.url.replace("/watch?v=", ""),
        title: item.title,
        poster: item.thumbnail,
        type: "movie",
        description: `Uploaded by ${item.uploaderName}`
      }));
    } catch (error) {
      console.error("YouTube Search Error:", error);
      return [];
    }
  }

  async getStreams(videoId) {
    try {
      const response = await fetch(`${this.apiBase}/streams/${videoId}`);
      const data = await response.json();

      const streams = [];

      if (data.hls) {
        streams.push({
          name: "HLS Stream",
          url: data.hls,
          quality: "Auto",
          type: "hls"
        });
      }

      if (data.videoStreams && data.videoStreams.length > 0) {
        data.videoStreams.forEach((stream) => {
          if (stream.format === "MPEG-4" && stream.url) {
            streams.push({
              name: `Direct MP4 (${stream.quality})`,
              url: stream.url,
              quality: stream.quality,
              type: "mp4"
            });
          }
        });
      }

      return streams;
    } catch (error) {
      console.error("YouTube Stream Error:", error);
      return [];
    }
  }
}

export default YouTubeVegaProvider;
