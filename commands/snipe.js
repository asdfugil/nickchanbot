const snipe = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "snipe"
});
const { RichEmbed } = require('discord.js')
module.exports = {
  name:'snipe',
  description:'view the last deleted message in the channel',
  async execute(message) {
    const m = await snipe.get(message.channel.id)
    if (!m) return message.reply("There is noting to snipe!")
    const embed = new RichEmbed()
    .setAuthor(m.author.tag,m.author.displayAvatarURL)
    .setDescription(m.content)
    .setTimestamp(m.createdTimestamp)
    .setColor("RANDOM")
    message.channel.send(embed)
  }
}