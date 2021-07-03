module.exports = {
	name: 'skip',
	description:{en: 'Skip a song!'},
  aliases:["s"],
  guildOnly:true,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
		if (!serverQueue) return message.channel.send('There is no song that I could skip!');
    serverQueue.connection?.dispatcher.end();
    message.channel.send('Song skipped.')
	},
};
