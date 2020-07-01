module.exports = {
  name:"disconnect",
  guildOnly:true,
  description:{en:"Make the bot leave voice chnanel"},
  async execute(message) {
    if (!message.guild.me.voice.channel) return message.reply("I am not connected to a voice channel.")
    if (message.guild.me.voice.speaking) return message.reply("Please use stop instead.")
    message.guild.me.voiceChannel.leave()
    message.channel.send("Left voice channel.")
  }
}