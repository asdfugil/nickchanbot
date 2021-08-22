const { snipe } = require('../../sequelize')
const { MessageEmbed } = require('discord.js')
module.exports = {
  name: 'snipe',
  clientPermissions: ['EMBED_LINKS'],
  async execute(message, args) {
    const msg = (await snipe.findOne({ where: { channel_id: message.channel.id } }))?.dataValues
    if (!msg) return message.reply('There is nothing to snipe!')
    const embed = new MessageEmbed()
      .setAuthor(msg.author_tag, msg.author_avatar_url)
      .setDescription(msg.content)
      .setTimestamp(msg.created_at)
      .setColor('RANDOM')
    message.channel.send({ embeds: [embed] })
      .catch(console.error)
  }
}