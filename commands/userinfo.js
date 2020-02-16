const { findUser } = require("../custom_modules/ncbutil.js")
const { RichEmbed } = require("discord.js")
module.exports = {
  name: "userinfo",
  aliases:["whois","user-info"],
  description: "shows user info",
  usage:"[user resolvable]",
  cooldown:2,
  execute: async (receivedMessage, args) => {
    let user 
    if (!args[0]) user = receivedMessage.author
    else user = await findUser(receivedMessage,args.join(" "))
    .catch(error => {
      if (error.code === 10013) return receivedMessage.reply("That's not a valid user!")
      else throw error
    })
    if (!user || !user.id) return
    const embed = new RichEmbed()
      .setAuthor(
        receivedMessage.author.tag,
        receivedMessage.author.displayAvatarURL
      )
      .setTitle("User Info")
      .setDescription(
        "Note:Some information cannot be displayed if the user is offline/Not playing a game/Not streaming/Not a human\nThe only reliable way of using this command is using the user ID as argument"
      )
      .addField("Tag", user.tag)
      .addField("Is Bot", user.bot)
      .addField("Joined Discord", user.createdAt)
      .addField("User ID", user.id)
      .addField("Avatar URL", user.displayAvatarURL)
      .setThumbnail(user.displayAvatarURL)
      .setColor("#00aaff")
      .setTimestamp()
      .setFooter(receivedMessage.client.user.tag, receivedMessage.client.user.displayAvatarURL);
    try {
      embed.addField("Status", user.presence.status);
      if (user.presence.game) {
        embed
          .addField("Playing", user.presence.game.name)
          .addField("Is streaming", user.presence.game.streaming)
          .addField("Stream URL", user.presence.game.url);
      }
    } catch (error) {}
    if (user.bot == false) {
      if (user.presence.status != "offline") {
        if (user.presence.status == user.presence.clientStatus.desktop)
          embed.addField("Using Discord On", "Desktop");
        if (user.presence.status == user.presence.clientStatus.web)
          embed.addField("Using Discord On", "Web");
        if (user.presence.status == user.presence.clientStatus.mobile)
          embed.addField("Using Discord On", "Mobile");
      }
    }
    receivedMessage.channel.send(embed);
  }
};
