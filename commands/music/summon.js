const { noBotPermission } = require("../../modules/ncbutil.js")
module.exports = {
  name:"summon",
  description:{ en:"make the bot join a voice channel" },
  cooldown:5,
  guildOnly:true,
  clientPermissions:['CONNECT'],
  async execute (message) {
  if (message.client.queue.get(message.guild.id)) return message.reply('I am already playing music in another channel.') 
  if (!message.member.voice.channel) return message.reply("You need to be in a voice channel to use this command.")
  if (!message.member.voice.channel.joinable) return noBotPermission("connect (to voice channel)",message.channel)
  message.member.voice.channel.join().then(() => message.channel.send("Joined voicd channel."))
}
}