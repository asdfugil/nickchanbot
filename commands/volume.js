module.exports = {
	name: 'volume',
	description: 'set/show volume',
  aliases:["v"],
  guildOnly:true,
  usage:"[volume]",
	async execute(message,args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to adjust/view the volume!');
		if (!serverQueue) return message.channel.send('There is nothing playing!');
    if (!args[0]) return message.channel.send("Volume = " + serverQueue.volume)
    if (isNaN(parseFloat(args[0]))) return message.reply("That's not a valid volume.")
    if (parseFloat(args[0]) < 0) return message.reply("Negative volume not yet supported.")
		serverQueue.volume = parseFloat(args[0])
    serverQueue.connection.dispatcher.setVolume(parseFloat(args[0]))
    message.reply("Volume set to "+args[0] + `(${parseFloat(args[0])*100}%)`)
    if (parseFloat(args[0]) > 2.5) message.reply("Warning:Setting the volume to a value larger than 2.5 may degrade audio quality.")
	},
};