const Keyv = require("keyv");
const globalLogHooks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
const { WebhookClient, RichEmbed } = require("discord.js");
module.exports = {
  name:"messageDeleteBulk",
  logged:"messages are deleted in bulk.",
  execute:async (packet,client) => {
    const guild = client.guilds.get(packet.d.guild_id)
    const channel = client.channels.get(packet.d.channel_id)
    const count = packet.d.ids.length
    const data = await globalLogHooks.get(packet.d.guild_id)
    if (!data) return
    const hookData = data.messageDeleteBulk
    if (!hookData) return
    const hook = new WebhookClient(hookData.id,hookData.token)
    const embed = new RichEmbed()
    .setAuthor(guild.name,guild.iconURL)
    .setDescription(`${count} messages deleted.`)
    .addField("Channel",channel.toString())
    .addField("Channel ID",channel.id)
    .setTimestamp()
    .setColor("#ff47ed")
    .setFooter(client.user.tag,client.user.displayAvatarURL)
    hook.send(embed)
    .catch(error => {
      delete data.messageDeleteBulk
      if (error.code === 10015) return globalLogHooks.set(guild.id,data)
      else throw error
    })
  }
}