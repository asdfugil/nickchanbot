const { noBotPermission } = require("../../custom_modules/ncbutil.js")
module.exports = {
  name:"summon",
  description:{ en:"make the bot join a voice channel" },
  cooldown:5,
  guildOnly:true,
  async execute (message) {
  if (!message.member.voice.channel) return message.reply("You need to be in a voice channel to use this command.")
  if (!message.member.voice.channel.joinable) return noBotPermission("connect (to voice channel)",message.channel)
  message.member.voice.channel.join().then(() => message.channel.send("Joined voicd channel."))
}
}