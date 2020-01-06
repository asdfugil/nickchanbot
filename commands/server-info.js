const { RichEmbed,Attachment } = require("discord.js");
module.exports = {
  name: "server-info",
  guildOnly: true,
  cooldown: 10,
  aliases: ["guild-info", "guildinfo", "serverinfo"],
  description: "shows server info",
  execute: (receivedMessage, args) => {
    const client = receivedMessage.client;
    const g = receivedMessage.guild;
    const data = [];
    let roles = [];
    let members = [];
    for (const key of Object.keys(g)) {
      if (["string", "number", "null"].includes(typeof g[key])) {
        if (typeof g[key] !== "null") data.push(`**${key}:** ${g[key]}`);
        else data.push(`**${key}:** N/A`);
      }
    }
    let i = 0
    let j = 0
    g.members.forEach(m => {
      if (i < 40) members.push(m.toString())
      i++
    })
    g.roles.forEach(r => {
      if (j < 40) roles.push(r.toString())
      j++
    })
    if (members.length > 40) members = `${members.join(" ")}...`
    else members = members.join(" ");
    if (roles.length > 40) roles = `${roles.join(" ")}...`
    else roles = roles.join(" ");
    const embed = new RichEmbed()
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
      .setImage(g.splashURL)
      .setThumbnail(g.iconURL)
      .setFooter(client.user.tag, client.user.displayAvatarURL);
    if (g.bannerURL) embed.attachFile(new Attachment(g.bannerURL,'server-banner.png'))
    receivedMessage.channel.send(embed);
  }
};
