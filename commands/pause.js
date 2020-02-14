module.exports = {
  name:"pause",
  description:"Pauses the music",
  guildOnly:true,
  async execute(message) {
    const serverQueue = message.client.queue.get(message.guild.id)
    if (!message.member.voiceChannel) return message.reply("You need to be in a voice chnanel to pause the music.")
    if (!serverQueue) return message.reply("There is nothing playing.")
    if (!serverQueue.connection.dispatcher.stream) return message.reply("You cannot pause when the bot is processing audio.")
    if (serverQueue.connection.paused) return message.reply("Already paused.")
    serverQueue.connection.dispatcher.stream.pause()
    serverQueue.connection.dispatcher.pause()
    message.channel.send("**Paused**")
  }
}