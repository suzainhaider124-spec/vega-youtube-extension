async function getStream() {
  return [
    {
      server: "Demo MP4",
      link: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
      type: "mp4",
      quality: "720p",
    },
  ];
}

exports.getStream = getStream;
