const { MessageEmbed, MessageAttachment, Collection } = require("discord.js");
module.exports = {
  name: "server-info",
  guildOnly: true,
  cooldown: 10,
  aliases: ["guild-info", "guildinfo", "serverinfo"],
  description: { en: "shows server info" },
  execute: async (message, args) => {
    const client = message.client;
    const g = message.guild;
    const data = [];
    let roles = [];
    let members = [];
    for (const key of Object.keys(g)) {
      if (["string", "number", "null", 'boolean'].includes(typeof g[key]) || g[key] instanceof Array || g[key] instanceof Collection) {
        if (typeof g[key] !== "null") data.push(`**${key.replace(/([^A-Z])([A-Z])/g, '$1 $2')}:** ${g[key]}`);
        else data.push(`**${key.replace(/([^A-Z])([A-Z])/g, '$1 $2')}:** N/A`);
      }
    }
    let i = 0
    let j = 0
    g.members.cache.forEach(m => {
      if (i < 40) members.push(m.toString())
      i++
    })
    g.roles.cache.forEach(r => {
      if (j < 40) roles.push(r.toString())
      j++
    })
    if (members.length > 40) members = `${members.join(" ")}...`
    else members = members.join(" ");
    if (roles.length > 40) roles = `${roles.join(" ")}...`
    else roles = roles.join(" ");
    const embed = new MessageEmbed()
      .setAuthor(g.name, g.iconURL)
      .setColor("#0000FF")
      .setDescription(
        data.join("\n") + `
**Server icon (if any):** Embed Thumbnail
**Invite splash (if any):** Embed Image
**Server banner (if any):** Message Attachment`
      )
      .addField("Members", members)
      .addField("Roles", roles)
      .setTimestamp()
      .setImage(g.splashURL({ format: 'png', size: 2048 }))
      .setThumbnail(g.iconURL({ format: 'png', size: 512 }))
      .setFooter(client.user.tag, client.user.displayAvatarURL);
    if (g.bannerURL({ format: 'png', size: 2048 })) message.channel.send({ embeds: [embed], files: [new MessageAttachment(g.bannerURL({ format: 'png', size: 2048 }), 'server-banner.png')] });
    else message.channel.send({ embeds: [embed] })
  }
};
