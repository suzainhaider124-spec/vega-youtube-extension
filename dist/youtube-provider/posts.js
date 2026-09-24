async function getPosts({ filter, page = 1, providerValue }) {
  return [
    {
      title: "Sample YouTube Video",
      link: "dQw4w9WgXcQ",
      image: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      provider: providerValue || "youtube-provider",
      tag: "YouTube Demo",
    },
  ];
}

async function getSearchPosts(args) {
  return getPosts(args);
}

exports.getPosts = getPosts;
exports.getSearchPosts = getSearchPosts;
