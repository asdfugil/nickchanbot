const { Attachment } = require("discord.js");
const fetch = require('node-fetch')
const SFWImages = [
  "smug",
  "baka",
  "tickle",
  "slap",
  "poke",
  "pat",
  "neko",
  "nekoGif",
  "meow",
  "lizard",
  "kiss",
  "hug",
  "foxGirl",
  "feed",
  "cuddle"
];
const NSFWImages = [
  "lewdkemo",
  "lewdk",
  "keta",
  "hololewd",
  "holoero",
  "hentai",
  "futanari",
  "femdom",
  "feetg",
  "erofeet",
  "feet",
  "ero",
  "erok",
  "erokemo",
  "eron",
  "eroyuri",
  "cum_jpg",
  "blowjob",
  "pussy"
];
module.exports = {
  name: "nekos-life",
  aliases: ["nekos", "neko", "nekoslife"],
  args: 1,
  usage: "<argument>",
  description: "Fetch a image from https://nekos.life",
  info:
    "Available arguments:\n\n`" +
    SFWImages.join("` `") +
    "`" +
    "\nNSFW:\n`" +
    NSFWImages.join("` `") +
    "`",
  execute: async (receivedMessage, args) => {
    receivedMessage.channel.startTyping();
    const api = "https://nekos.life/api/v2/img/";
    if (SFWImages.includes(args[0]))
      return receivedMessage.channel
        .send(
          new Attachment(
            (await fetch(api + args[0]).then(response => response.json())).url
          )
        )
        .then(() => receivedMessage.channel.stopTyping());
    else if (NSFWImages.includes(args[0])) {
      if (receivedMessage.channel.nsfw)
        return receivedMessage.channel
          .send(
            new Attachment(
              (await fetch(api + args[0]).then(response => response.json())).url
            )
          )
          .then(() => receivedMessage.channel.stopTyping());
      else
        receivedMessage
          .reply("NSFW arguments can only be used in NSFW channels.")
          .then(() => receivedMessage.channel.stopTyping());
    } else
      return receivedMessage
        .reply(
          "Invalid arguments,available arguments:\nSFW:\n`" +
            NSFWImages.join("` `") +
            "`\n\nNSFW:\n`" +
            NSFWImages.join("` `") +
            "`"
        )
        .then(() => receivedMessage.channel.stopTyping());
  }
};
