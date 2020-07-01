const { MessageEmbed } = require("discord.js")
module.exports = {
  name:"queue",
  description:{en:"shows music queue."},
  aliases:["q"],
  guildOnly:true,
  async execute(message) {
    const { queue } = message.client
    const serverQueue = queue.get(message.guild.id)
    if (!serverQueue) return message.reply("There is nothing in the queue")
    const formatted = serverQueue.songs.map((song,index) => {
      const position = index + 1
      const item = `${position}.[${song.title}](${song.url})`
      return item
    }).join("\n")
    const embed = new MessageEmbed()
    .setAuthor("Music Queue","https://cdn.glitch.com/ae1bf1e9-34d2-43e8-af23-88db1cbe9616%2F06C28668-C28E-47B9-9AF0-7E73F1FCE1D2.jpeg?v=1580381492008")
    .setDescription(formatted)
    .setColor("#FF0000")
    message.channel.send(embed)
  }
}