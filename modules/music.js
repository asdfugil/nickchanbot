class Song {
	constructor(options) {
		this.url = options.url
		this.title = options.title
		this.type = options.type || "youtube-dl"
	}
}
class Queue {
	constructor(options) {
		this.voiceChannel = options.voiceChannel
		this.textChannel = options.textChannel
		this.connection = options.connection || null
		this.songs = options.songs || []
		this.volume = options.volume || 1
		this.playing = options.playing || false
		this.looping = options.looping || false
	}
}
module.exports = { Song, Queue, }
