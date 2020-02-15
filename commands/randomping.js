const { RichEmbed } = require("discord.js");
const { noBotPermission } = require("../custom_modules/ncbutil.js")
module.exports = {
  name: "randomping",
  aliases: ["random-ping"],
  description: "Randomly pings people",
  usage: "[message]",
  cooldown: 180,
  guildOnly: true,
  async execute(message, args) {
    if (!message.channel.permissionsFor(message.guild.me).serialize().MANAGE_MESSAGES) return noBotPermission("manage messages",message.channel)
    const embed = new RichEmbed()
      .setTitle("Random ping from " + message.author.tag)
      .setColor("#03cffc")
      .setDescription(args.join(" "));
    message.delete()
    message.channel.send(message.guild.members.random().toString(), {
      embed: embed,
      files:message.attachments.array().map(x => x.proxyURL)
    });
  }
};
