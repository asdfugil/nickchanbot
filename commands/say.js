const { noBotPermission } = require("../custom_modules/ncbutil.js")
module.exports = {
  name:"say",
  usage:"<content ,embed,and/or attachment(s)>",
  description:"Make the bot say something",
  info:"content,embed,attachment(s), and tts is replicated.",
  async execute (message,args) {
    if (message.system) return
    if (!message.channel.permissionsFor(message.guild.me).serialize().MANAGE_MESSAGES) return noBotPermission("manage messages",message.channel)
    if (!args[0] && !message.attachments.first() && !message.embeds[0]) return message.reply("Please enter something for the bot to say!")
    message.channel.send(args.join(" ") + "\n\n -- "+message.author.tag,{
      embed:message.embeds[0],
      files:message.attachments.array().map(x => x.proxyURL),
      split:true,
      disableEveryone:true,
      tts:message.tts
    }).then(m => message.delete())
  }
}