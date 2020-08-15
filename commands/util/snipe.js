const { snipe } = require('../../sequelize')
const { MessageEmbed } = require('discord.js')
module.exports = {
  name: 'snipe',
  clientPermissions: ['EMBED_LINKS'],
  async execute(message, args) {
    const msg = (await snipe.findOne({ where: { channel_id: message.channel.id } })).dataValues
    if (!msg) return message.reply('There is nothing to snipe!')
    //   const attachments = msg.attachments.split(',').map(base64 => Buffer.from(base64,'base64'))
    const embed = new MessageEmbed()
      .setAuthor(msg.author_tag, msg.author_avatar_url)
      .setDescription(msg.content)
      //.attachFiles(attachments)
      .setTimestamp(msg.created_at)
      .setColor('RANDOM')
    message.channel.send("", { embed: embed })
      .catch(console.error)
  }
}