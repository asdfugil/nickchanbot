const Discord = require('discord.js');
const {
	prefix,
	token,
	ownerID,
} = require('./config/config.json');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

const queue = new Map();

process.on('uncaughtException', error => {
	console.log(error.stack)
})
process.on('unhandledRejection', (error, promise) => {
	console.log(error.stack)
	console.log(JSON.stringify(promise, null, 2))
})
client.once('ready', () => {
	console.log('Ready!');
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async receivedMessage => {
	let arguments = receivedMessage.content.substr(prefix.length).split(' ').slice(1)
	if (!receivedMessage.guild) return
	if (receivedMessage.author.bot) return;
	if (!receivedMessage.content.startsWith(prefix)) return;

	const serverQueue = queue.get(receivedMessage.guild.id);

	if (receivedMessage.content.startsWith(`${prefix}play`)) {
		execute(receivedMessage, serverQueue);
		return;
	} else if (receivedMessage.content.startsWith(`${prefix}skip`)) {
		skip(receivedMessage, serverQueue);
		return;
	} else if (receivedMessage.content.startsWith(`${prefix}stop`)) {
		stop(receivedMessage, serverQueue);
		return;
	} else if (receivedMessage.content.startsWith(`${prefix}queue`)) {
queueCommand(receivedMessage,serverQueue,arguments)
	} else if (receivedMessage.content.startsWith(`${prefix}now-playing`)) {
		nowPlaying(receivedMessage, serverQueue)
	}
});
function nowPlaying(receivedMessage, serverQueue) {
	if (typeof serverQueue != 'undefined') {
		if (typeof serverQueue.songs != 'undefined') {
			receivedMessage.channel.send(`\`\`\`json\n${JSON.stringify(serverQueue.songs[0], null, 2)}\`\`\``)
		}
	} else {
		receivedMessage.channel.send('There is nothing playing')
	}
}
function queueCommand(receivedMessage,serverQueue,arguments) {
	if (!arguments[0]) {
		if (typeof serverQueue != 'undefined') {
			if (typeof serverQueue.songs != 'undefined') {
				receivedMessage.channel.send(`\`\`\`json\n${JSON.stringify(serverQueue.songs, null, 2)}\`\`\``)
			}
		} else {
			receivedMessage.channel.send('There is nothing in the queue')
		}
	} else {
		if (typeof serverQueue != 'undefined') {
			if (typeof serverQueue.songs != 'undefined') {
		if (!Number(arguments[0]) == NaN) return receivedMessage.channel.send('Argument is not a number.')
		if (Math.round(arguments[0]) != arguments[0]) return receivedMessage.channel.send('Arguments is not a integer.')
		let i = arguments[0] - 1
		if (i > serverQueue.songs.length || i < 0) return receivedMessage.channel.send("Out of range.")
		receivedMessage.channel.send(`\`\`\`json\n${JSON.stringify(serverQueue.songs[i], null, 2)}\`\`\``)
			}
		} else {
			receivedMessage.channel.send('There is nothing in the queue')
		}
	}
	
}
async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
			message.channel.send('Playing ' + song.title)
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
	message.channel.send('Music Ended.')
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(token);