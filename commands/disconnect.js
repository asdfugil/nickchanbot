module.exports = {
  name:"disconnect",
  guildOnly:true,
  description:"Make the bot leave voice chnanel",
  async execute(message) {
    if (!message.guild.me.voiceChannel) return message.reply("I am not connected to a voice channel.")
    if (message.guild.me.speaking) return message.reply("Please use stop instead.")
    message.guild.me.voiceChannel.leave()
    message.channel.send("Left voice channel.")
  }
}