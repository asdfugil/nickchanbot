require('dotenv').config()
const { language } = require('../../sequelize')
const t = require('..')
module.exports = {
  name: 'set-language',
  guildOnly: true,
  translations: {
    lang_set: {
      en: "Language set",
      zh: "成功更改語言"
    }
  },
  async execute(message, args) {
    if (!message.member.hasPermission('MANAGE_GUILD')) return
    await language.upsert({ id:message.guild.id,language:args.join(' ') })
    message.guild.language = args.join(' ')
      message.channel.send(t('commands.set-language.lang_set', message.client, message.guild))
  }
}