require("dotenv").config();
const AniList = require("anilist-node");
const anilist = new AniList(process.env.ANILIST_TOKEN);
module.exports = {
  name: "manga",
  args: true,
  usage: {en:"<query>"},
  description:{en: "Search manga on AniList."},
  info: "A raw JSON file will also be provided.",
  async execute(message, args) {
    /*
    Type:manga
    Page number:1
    20 results per page
    */
    anilist
      .search("manga", args.join(" "), 1, 20)
      .then(async results => {
        const content = results.media.map(
          result =>
            `${result.title.english || "(English title unavailable)"}  (${
              result.title.native
            }) - ID:${result.id}`
        );
        const displayMsg = await message.channel.send(
          `Type the ID to see the details. (60 seconds)
Showing page ${results.pageInfo.currentPage} of ${results.pageInfo.total}
${content.join("\n")}`,
          { code: true }
        );
        message.channel
          .createMessageCollector(
            x => x.author.id === message.author.id && parseInt(x),
            {
              time: 60000,
              maxMatches: 1
            }
          )
          .on("collect", m => {
            message.client.commands
              .get("manga-byid")
              .getManga(message, parseInt(m.content));
          });
      })
      .catch(console.error);
  }
};
