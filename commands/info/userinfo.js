const { findUser } = require("../../modules/ncbutil.js")
const { MessageEmbed } = require("discord.js")
module.exports = {
  name: "userinfo",
  aliases: ["whois", "user-info"],
  description: { en: "shows user info" },
  usage: {en:"[user resolvable]"},
  cooldown: 2,
  execute: async (message, args) => {
    let user
    if (!args[0]) user = message.author
    else user = await findUser(message, args.join(" "))
      .catch(error => {
        if (error.code === 10013) return
        else throw error
      })
    if (!user) return message.reply("That's not a valid user!")
    const embed = new MessageEmbed()
      .setAuthor(
        message.author.tag,
        message.author.displayAvatarURL
      )
      .setTitle("User Info")
      .setDescription(
        "Note:Some information cannot be displayed if the user is offline/Not playing a game/Not streaming/Not a human\nThe only reliable way of using this command is using the user ID as argument"
      )
      .addField("Tag", user.tag)
      .addField("Is Bot", user.bot)
      .addField("Joined Discord", user.createdAt)
      .addField("User ID", user.id)
      .addField("Avatar URL", user.displayAvatarURL({ size: 4096, format: 'png', dynamic: true }))
      .setThumbnail(user.displayAvatarURL({ size: 512, format: 'png',dynamic:true }))
      .setColor("#00aaff")
      .setTimestamp()
      .setFooter(message.client.user.tag, message.client.user.displayAvatarURL);
    try {
      embed.addField("Status", user.presence.status);
      if (user.presence.game) {
        embed
          .addField("Playing", user.presence.game.name)
          .addField("Is streaming", user.presence.game.streaming)
          .addField("Stream URL", user.presence.game.url);
      }
    } catch (error) { }
    if (user.bot == false) {
      if (user.presence.status != "offline") {
        embed.addField('Using Discord on', Object.keys(user.presence.clientStatus).join(', ') || 'N/A')
      }
      message.channel.send(embed);
    }
  }
}