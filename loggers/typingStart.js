const Keyv = require('keyv')
const globalLogHooks = new Keyv('sqlite://.data/database.sqlite',{namespace:'log-hooks'})
const { WebhookClient,RichEmbed } = require('discord.js')
module.exports = {
  name:'typingStart',
  logged:'when a member starts typing',
  execute:async (channel,user) => {
    if (!channel.guild) return
    if (!await globalLogHooks.get(channel.guild.id)) return
    const hookData = (await globalLogHooks.get(channel.guild.id)).typingStart
    if (!hookData) return
    const hook = new WebhookClient(hookData.id,hookData.token)
    const embed = new RichEmbed()
    .setAuthor(user.tag,user.displayAvatarURL)
    .setColor('#FFFFFF')
    .setTitle('User started typing')
    .setDescription(`${user.toString()} started typing in ${channel.toString()}.`)
    .setTimestamp()
    .setFooter(channel.client.user.tag,channel.client.user.displayAvatarURL)
    hook.send(embed)
    .catch(console.error)
  }
}