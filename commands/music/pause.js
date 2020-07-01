const { Message } = require('discord.js')
module.exports = {
  name:"pause",
  description:{ en:"Pauses the music"},
  guildOnly:true,
  /**
   * @param { Message } message 
   */
  async execute(message) {
    const serverQueue = message.client.queue.get(message.guild.id)
    if (!message.member.voice.channel) return message.reply("You need to be in a voice chnanel to pause the music.")
    if (!serverQueue) return message.reply("There is nothing playing.")
    if (serverQueue.connection.paused) return message.reply("Already paused.")
    serverQueue.connection.dispatcher.pause()
    message.channel.send("**Paused**")
  }
}