module.exports = {
	name: 'nowplaying',
  aliases:["now-playing"],
  guildOnly:true,
	description: {en:'Get the song that is playing.'},
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		return message.channel.send(`Now playing: ${serverQueue.songs[0].title}`);
	},
};