module.exports = {
	name: 'volume',
	description: {en:'set/show volume'},
  aliases:["v"],
  guildOnly:true,
  usage:"[volume]",
  clientPermissions:['CONNECT','SPEAK'],
	async execute(message,args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to adjust/view the volume!');
	if (!serverQueue) return message.channel.send('There is nothing playing!');
    if (!args[0]) return message.channel.send("The current volume is " + (serverQueue.volume * 100) + "%")
    if (isNaN(parseFloat(args[0]))) return message.reply("That's not a valid volume.")
    if (parseFloat(args[0]) < 0) return message.reply("Negative volume not yet supported.")
	if (parseFloat(args[0]) > 1000) return message.reply("maximum volume is 1000%")
	serverQueue.volume = parseFloat(args[0])/100
    serverQueue.connection.dispatcher.setVolume(parseFloat(args[0])/100)
    message.reply("Volume set to "+args[0] + `%`)
    if (parseFloat(args[0]) > 250) message.reply("Warning:Setting the volume to a value larger than 250% may degrade audio quality.")
	},
};
