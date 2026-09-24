async function getMeta({ link, providerContext }) {
  const id = link.includes("/") ? link.split("/").filter(Boolean).pop() || link : link;
  const image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  let title = "YouTube video", synopsis = "";
  try { const data = (await providerContext.axios.get(`https://pipedapi.kavin.rocks/streams/${encodeURIComponent(id)}`)).data || {}; title = data.title || title; synopsis = data.description || ""; } catch {}
  return { title, image, poster: image, synopsis, imdbId: id, type: "movie", linkList: [{ title: "YouTube", directLinks: [{ title, link: id, type: "movie" }] }], webUrl: `https://www.youtube.com/watch?v=${id}` };
}
export { getMeta };
