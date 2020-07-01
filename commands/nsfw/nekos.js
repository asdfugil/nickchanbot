const { MessageAttachment } = require("discord.js");
const fetch = require('node-fetch')
const valid_args = [
  "smug", "baka", "tickle", "slap", "poke", "pat", "neko", "nekoGif", "meow", "lizard", "kiss", "hug", "foxGirl", "feed", "cuddle", "lewdkemo", "lewdk", "keta", "hololewd", "holoero", "hentai", "futanari", "femdom", "feetg", "erofeet", "feet", "ero", "erok", "erokemo", "eron", "eroyuri", "cum_jpg", "blowjob", "pussy"
];
module.exports = {
  name: "nekos-life",
  aliases: ["nekos", "nekos", "nekos.life"],
  args: 1,
  nsfw: true,
  usage: { en: "<argument>" },
  description:
    { en: "Fetch a image from `https://nekos.life`" },
  clientPermissions: ['ATTACH_FILES'], info: {
    en:
      "Valid arguments:\n\n`" +
      valid_args.join("` `") +
      "`"
  }, async execute(message, args) {
    message.channel.startTyping();
    const api = "https://nekos.life/api/v2/img/";
    if (!valid_args.includes(args.join(' '))) return message.reply("That's not a valid argument!")
    const { url } = await fetch(api + args.join(' ')).then(res => res.json())
    message.channel.send(new MessageAttachment(url))
    message.channel.stopTyping()
  }
};
