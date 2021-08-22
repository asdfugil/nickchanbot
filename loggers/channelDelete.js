const { RichEmbed , WebhookClient } = require('discord.js')
const globalLogHooks = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
module.exports = {
  name:"channelDelete",
  logged:"a channel is deleted",
  async execute (channel) {
    if (!channel.guild) return
    const data = await globalLogHooks.get(channel.guild.id)
    if (!data) return
    const hookData = data.channelDelete
    if (!hookData) return
    const { id,token } = hookData
    const hook = new WebhookClient(id,token)
    const { displayAvatarURL, tag } = channel.client.user
    const embed = new RichEmbed()
    .setAuthor(channel.guild.name,channel.guild.iconURL)
    .setTitle("Channel Deleted")
    .setDescription(channel.name)
    .addField("Channel ID",channel.id)
    .addField("Type",channel.type)
    .setFooter(tag,displayAvatarURL)
    .setColor(0xff0000)
    .setTimestamp(channel.createdAt)
    hook.send({ embeds: [embed] }).catch(error => {
      if (error.code === 10015) {
        delete data.channelDelete
        globalLogHooks.set(channel.guild.id,data)
      }
        else throw error
    })
  }
}