module.exports = {
  name:"remove-song",
  aliases:["rm","rm-song"],
  description:"removes a song from queue",
  args:1,
  guildOnly:true,
  usage:"<song position>",
  async execute (message,args) {
    const serverQueue = message.client.queue.get(message.guild.id)
    const num = parseInt(args[0])
    if (isNaN(num)) return message.reply("Invald number")
    if (!serverQueue) return message.reply("There is nothing in the queue to remove.")
    if (num < 1 || num > (serverQueue.songs.length + 1)) return message.reply("Position out of range.")
    const removed = serverQueue.songs.splice(num - 1,1)
    message.channel.send(`${removed[0].title} is removed from the queue.`)
  }
}