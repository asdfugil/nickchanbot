const { MessageEmbed } = require("discord.js");
const { noBotPermission } = require("../../modules/ncbutil.js")
module.exports = {
  name: "@someone",
  aliases: ["random-ping"],
  description: {en:"Randomly pings people"},
  usage: {en:"[message]"},
  cooldown: 180,
  guildOnly: true,
  async execute(message, args) {
    if (!message.channel.permissionsFor(message.guild.me).serialize().MANAGE_MESSAGES) return noBotPermission("manage messages",message.channel)
    const embed = new MessageEmbed()
      .setTitle("Random ping from " + message.author.tag)
      .setColor("#03cffc")
      .setDescription(args.join(" "));
    message.delete()
    message.channel.send(message.guild.members.cache.random().toString(), {
      embed: embed,
      files:message.attachments.map(x => x.proxyURL)
    });
  }
};
