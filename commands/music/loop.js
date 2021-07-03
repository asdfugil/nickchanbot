module.exports = {
  name:"loop",
  usage:{en:"<song|queue|disabled>"},
  description:{en:"set music loop mode"},
  args:1,
  guildOnly:true,
  async execute(message,args) {
    if (!message.member.voice.channel) return message.reply("You have to be in a voice channel to set the loop mode!")
    const serverQueue = message.client.queue.get(message.guild.id)
    if (!serverQueue) return message.reply("There is nothing to loop.")
    if (args[0] === "song") serverQueue.looping = "song"
    else if (args[0] === "queue") serverQueue.looping = "queue"
    else if (args[0] === "disabled") serverQueue.looping = false
    else return message.reply("That's not a valid option!")
    message.channel.send("Loop mode set to " + args[0])
  }
}