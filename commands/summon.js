const { noBotPermission } = require("../custom_modules/ncbutil.js")
module.exports = {
  name:"summon",
  description:"make the bot join a voice channel",
  cooldown:5,
  guildOnly:true,
  async execute (message) {
  if (!message.member.voiceChannel) return message.reply("You need to be in a voice channel to use this command.")
  if (!message.member.voiceChannel.joinable) return noBotPermission("connect (to voice channel)",message.channel)
  message.member.voiceChannel.join().then(() => message.channel.send("Joined voicd channel."))
}
}