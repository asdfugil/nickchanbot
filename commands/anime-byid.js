module.exports = {
  name: "anime-byid",
  aliases: "getAnimeByID, animebyid",
  description: "GET an anime by its anilist id",
  async execute(message, args) {
    message.client.commands
      .get("anime")
      .getAnime(message, parseInt(args.join(" ")));
  }
};
