const { noBotPermission } = require("../../modules/ncbutil.js")
module.exports = {
  name:"say",
  usage:{en:"<content ,embed,and/or attachment(s)>"},
  description:{en:"Make the bot say something"},
  info:{en:"content,embed,attachment(s), ability to `@everyone` ,and tts is replicated."},
  async execute (message,args) {
    if (message.system) return
    if (!message.channel.permissionsFor(message.guild.me).serialize().MANAGE_MESSAGES) return noBotPermission("manage messages",message.channel)
    if (!args[0] && !message.attachments.first() && !message.embeds[0]) return message.reply("Please enter something for the bot to say!")
    message.channel.send(args.join(" ") + "\n\n -- "+message.author.tag,{
      embed:message.embeds[0],
      files:message.attachments.map(x => x.url),
      split:true,
      disableEveryone:message.member ? !message.channel.permissionsFor(message.member).has(131072): false ,
      tts:message.tts
    }).then(m => message.delete())
  }
}