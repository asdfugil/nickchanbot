const { RichEmbed,WebhookClient } = require("discord.js")
const globalLogHooks = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"log-hooks"})
module.exports = {
  name:"typingStop",
  logged:"a user stops typing",
  execute:async (channel,user) => {
    if (!channel.guild) return
    if (!await globalLogHooks.get(channel.guild.id)) return
    const hookData = (await globalLogHooks.get(channel.guild.id)).typingStop
    if (!hookData) return
    const hook = new WebhookClient(hookData.id,hookData.token)
    const embed = new RichEmbed()
    .setAuthor(user.tag,user.displayAvatarURL)
    .setColor('#FFFFFF')
    .setTitle('User stopped typing')
    .setDescription(`${user.toString()} stopped typing in ${channel.toString()}.`)
    .setTimestamp()
    .setFooter(channel.client.user.tag,channel.client.user.displayAvatarURL)
    hook.send({ embeds: [embed] })
    .catch(async error => {
      if (error.code === 10015) {
       const data = delete (await globalLogHooks.get(channel.guild.id)).typingStop
       globalLogHooks.set(channel.guild.id,data)
      } else throw error
    })
  }
}