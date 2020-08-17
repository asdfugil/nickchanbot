module.exports = {
	name: 'stop',
	description: {en:'Stop all songs in the queue and disconnect!'},
  guildOnly:true,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
    if (!serverQueue) return message.reply("There is nothing to stop!")
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end();
	},
};