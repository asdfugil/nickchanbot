require("dotenv").config();
const AniList = require("anilist-node");
const anilist = new AniList(process.env.ANILIST_TOKEN);
const { MessageEmbed,MessageAttachment } = require("discord.js");
const { writeFileSync } = require("fs");
module.exports = {
  name: "anime",
  args: true,
  usage:{en: "<query>"},
  description:{en: "Search anime on AniList." },
  info: { en:"A raw JSON file will also be provided. Some fields will be truncated as they are too long"},
  async execute(message, args) {
    /*
    Type:anime
    Page number:1
    20 results per page
    */
    anilist
      .search("anime", args.join(" "), 1, 20)
      .then(async results => {
        const content = results.media.map(
          result =>
            `${result.title.english || "(English title unavailable)"}  (${
              result.title.native
            }) - ID:${result.id}`
        );
        const displayMsg = await message.channel.send(
          `\`\`\`Type the ID to see the details. (60 seconds)
Showing page ${results.pageInfo.currentPage} of ${results.pageInfo.total}
${content.join("\n")}\`\`\``
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
            module.exports.getAnime(message, parseInt(m.content));
          });
      })
      .catch(console.error);
  },
  async getAnime(message, id) {
    anilist.media
      .anime(id)
      .then(async anime => {
        if (!anime.siteUrl)
          return message.reply("That's not a valid anime ID!");
        if (anime.isAdult && !message.channel.nsfw)
          return message.reply(
            "That anime contains NSFW content,please try again in a NSFW channel."
          );
        const character = await anilist.people.character(
          anime.characters[0].id
        );
        console.log(character);
        const embed = new MessageEmbed()
          .setAuthor(anime.staff[0].native || anime.staff[0].name)
          .setURL(anime.siteUrl)
          .setTitle(
            anime.title.romaji || anime.title.english || anime.title.native
          )
          .setDescription(anime.description.replace(/(<([^>]+)>)/gi, ""))
          .addField("Native title", anime.title.native || anime.title.english)
          .addField("Romaji Title", anime.title.romaji || "N/A")
          .addField("English title", anime.title.romaji || "N/A")
          .addField(
            "Links",
            anime.externalLinks?.map((link, index) => `[${index}](${link})`)
              .join(",") || "N/A"
          )
          .addField("Episode length", anime.duration + " minutes")
          .addField("Source type", anime.source)
          .addField("Twitter hashtag", anime.hashtag || "N/A")
          .addField("Country of origin", anime.countryOfOrigin)
          .addField("Popularity", anime.popularity?.toString())
          .addField("Episodes", anime.episodes.toString())
          .addField("Format", anime.format)
          .addField("Status", anime.status)
          .addField(
            "Tags",
            anime.tags
              .map(tag => {
                if (!tag.isMediaSpoiler) return tag.name;
                else return `||${tag.name}||`;
              })
              .join(", ")
          )
          .addField("Season", anime.season)
          .addField(
            "Start Date",
            `${anime.startDate.day}-${anime.startDate.month}-${anime.startDate.year}`
          )
          .addField(
            "End date",
            `${anime.endDate.day}-${anime.endDate.month}-${anime.endDate.year}`
          )
          .addField(
            "Characters",
            anime.characters.map(x => `${x.name}  (${x.id})`).join(", ").substring(0,1023)
          )
          .addField(
            "Staff",
            anime.staff
              .map(x => `${x.native || x.name} (${x.name}) - ID: ${x.id}`)
              .join("\n").substring(0,1023)
          )
          .addField(
            "Studios",
            anime.studios.map(x => `${x.name} (ID:${x.id})`).join(", ") || "N/A"
          )
          .addField("Weighted mean score", anime.averageScore + "/100")
          .addField("Trending", anime.trending.toString() || 'N/A')
          .addField("Mean Score", anime.meanScore + "/100")
          .addField("Genres", anime.genres.toString())
          .addField("NSFW", anime.isAdult.toString() || 'false')
          .setThumbnail(anime.coverImage.large)
          .addField(
            "Misc",
            `AniList ID: ${anime.id}
MAL ID:${anime.idMal}`
          )
        // 25 fields
        embed.setColor("RANDOM");
        if ([100977, 108631, 105662, 109085].includes(anime.id))
          embed.setColor("#E15d4a");
        const embed2 = new MessageEmbed()
          .setColor(embed.color)
          .setFooter(
            `${character.name.native || ""}  (${
              character.name.first
            } ${character.name.last || ""})`,
            character.image.large
          )
          .setImage(anime.bannerImage)
          .addField("Synonyms",(() => anime.synonyms ? anime.synonyms.join(", ") : "N/A")())
          .addField(
            "Relations",
            anime.relations
              .map(r => {
                return `**${r.title.romaji ||
                  r.title.english ||
                  r.title.native}** (ID:${r.id})`;
              })
              .join(" ,") || "N/A"
          )
          .addField("Last updated", (new Date(anime.updatedAt * 1000)).toString());
        await message.channel.send({ content: anime.trailer || undefined,  embeds: [embed,embed2], files:[
          new MessageAttachment(Buffer.from(JSON.stringify(anime,null,2)),anime.id.toString() + '.json')
        ] });
      })
      .catch(console.error);
  }
};
