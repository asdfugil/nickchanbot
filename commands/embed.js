const { RichEmbed } = require("discord.js");
const isurl = require("isurl");
module.exports = {
  name: "embed",
  usage: "[description]",
  description: "sends a custom embed (INDEV)",
  execute: async (message, args) => {
    const embed = new RichEmbed();
    const n =
      "Type `none` to set something to none (expect description,you can type nothing).\n";
    const m = await message.channel.send(
      n + "What hex color do you wnat the embed to have? (15 seconds)"
    );
    message.channel
      .awaitMessages(
        x =>
          x.author.id === message.author.id &&
          (x.length === 4 || x.length === 7 || x.length === 6),
        { maxMatches: 1, time: 15000 }
      )
      .then(msg => {
        if (msg.content === "cancel") throw new Error("Command cancelled");
        if (msg.content !== "none") embed.setColor(m.content);
        msg.delete();
        m.edit(n + "What is the name of the author? (30 seconds)");
        return message.channel.awaitMessages(
          x => x.author.id === message.author.id,
          { maxMatches: 1, time: 30000 }
        );
      })
      .then(async msg => {
        if (msg.content === "cancel") throw new Error("Command cancelled");
        msg.delete();
        m.edit(n + "What is the author avatar URL? (100 seconds)");
       return await message.channel
          .awaitMessages(
            x =>
              x.author.id === message.author.id &&
              (isurl(message.content) ||
                message.content === "none" ||
                message.content === "cancel"),
            { time: 100000, maxMatches: 1 }
          )
          .then(msg2 => {
          msg2.delete()
         if (msg.content === "cancel") throw new Error("Command cancelled");
         if (msg.content === "none" && msg2.content !== "none") embed.setAuthor(null,msg2)
         if (msg2.content === "none") embed.setAuthor(msg)
         else embed.setAuthor(msg,msg2)
         m.edit("What is the embed URL? (100 seconds)")
         return message.channel.awaitMessages(x =>
              x.author.id === message.author.id &&
              (isurl(message.content) ||
                message.content === "none" ||
                message.content === "cancel"),
            { time: 100000, maxMatches: 1 })
        })
      }).then(msg => {
      if (msg.content === "cancel") throw new Error("Command cancelled");
      if (msg.conten !== "none") embed.setURL(msg.content)
    })
      .catch(() => message.reply("Command cancelled"));
  }
};
