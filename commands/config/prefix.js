require('dotenv').config()
const { prefixes } = require('../../sequelize')
const t = require('..')
module.exports = {
  name: 'prefix',
  guildOnly: true,
  args:1,
  translations: {
    lang_set: {}
  },
  async execute(message, args) {
    if (!message.member.hasPermission('MANAGE_GUILD')) return
    let prefix = args.join(" ")
    if (prefix.startsWith(" ")) return message.reply("Prefixes cannot start with a space.")
    if (prefix.startsWith("	")) return message.reply("Prefixes cannot start with tabs.")
    prefix = prefix
	.replace("\\\\","	ESCAPE	BACKSLASH	")
	.replace("\\_","	ESCAPE	UNDERSCORE	")
	.replace("_"," ")
	.replace("	ESCAPE	BACKSLASH	","\\")
	.replace("	ESCAPE	UNDERSCORE	","_")
      if (!prefix) return message.channel.send("Prefix cannot be empty")
      await prefixes.destroy({ where: { guild_id: message.guild.id }})
      prefixes.upsert({ guild_id: message.guild.id ,prefix }).then(() => {
      message.channel.send("Prefix set to `" + prefix + "`.")})
  }
}
