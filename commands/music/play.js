require("dotenv").config();
const { YTSearcher } = require("ytsearcher");
const youtubedl = require("youtube-dl-exec")
const spdl = require("spdl-core")
const { Song, Queue } = require("../../modules/music.js")
const searcher = new YTSearcher({ key: process.env.YOUTUBE_KEY });
module.exports = {
  name: "play",
  description: { en: "plays music" },
  guildOnly: true,
  aliases: ["p"],
  usage: { en: "<YouTube search query|youtube-dl supported URL|spotify URL>" },
  args: true,
  cooldown: 2,
  clientPermissions: ['CONNECT', 'SPEAK'],
  info: { en: "See https://ytdl-org.github.io/youtube-dl/supportedsites.html for specifically-supported URLs. Other sites may or may not work." },
  execute: async (message, args) => {
    const { queue } = message.client;
    const serverQueue = queue.get(message.guild.id);
    const channel = message.member.voice.channel;
    if (!channel)
      return message.reply("You must be in a voice channel to play music!");
    let song_type = "youtube-dl";
    let result;
    if (!args.join(" ").startsWith("http://") && !args.join(" ").startsWith("https://")) {
      result = (await searcher.search(args.join(" "))).first;
    } else if (spdl.validateURL(args.join(" "))) {
      song_type = "spotify";
      result = (await spdl.getInfo(args.join("")))
    } else {
      const resulttext = await youtubedl(args.join(" "), {
        noWarnings: true,
        noCallHome: true,
        simulate: true,
        getTitle: true,
      }).catch(error => { message.channel.send(error.message.split("--simulate --get-title")[1]) })
      if (!resulttext) return
      result = {
        title: resulttext.split("\n")[0],
        url: args.join(" ")
      }
    }
    const song = new Song({
      title: result.title,
      url: result.url,
      type: song_type
    });

    if (!serverQueue) {
      const queue_new = new Queue({
        textChannel: message.channel,
        voiceChannel: channel,
        connection: null,
        songs: [],
        volume: 1,
        playing: true,
        looping: false
      });

      queue.set(message.guild.id, queue_new);

      queue_new.songs.push(song);

      try {
        const connection = await channel.join();
        queue_new.connection = connection;
        module.exports.play(message, queue_new.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  },
  async play(message, song) {
    const guild = message.guild;
    const { queue } = message.client;
    const serverQueue = queue.get(message.guild.id);

    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    try {
      const songStream = await module.exports.getSongStream(song);
      const dispatcher = serverQueue.connection
        .play(songStream, { passes: 2 })
        .on("speaking", speaking => {
          if (speaking) return
          if (serverQueue.looping !== "song") {
            if (serverQueue.looping === "queue") serverQueue.songs.push(serverQueue.songs[0]);
            serverQueue.songs.shift();
          }
          module.exports.play(message, serverQueue.songs[0]);
        })
        .on("error", error => {
          message.channel.send(`Skipping ${song.title} due to error: \`\`\`\n${error.message}\n\`\`\``)
          serverQueue.songs.shift();
          console.error(error);
        });
      if (!serverQueue.looping) message.channel.send(`Started playing ${song.title}.`);
      dispatcher.setVolume(serverQueue.volume);
      dispatcher.setPLP(0.1)
    } catch (error) {
      console.log(error)
      module.exports.play(message, serverQueue.songs[0]);
    }
  },
  getSongStream(song) {
    if (song.type === "youtube-dl") {
      return youtubedl.raw(song.url, {
        output: "-",
        noWarnings: true,
        noCallHome: true,
        preferFreeFormats: true,
        format: "opus/bestaudio/best",
      }).stdout
    } else if (song.type === "spotify") {
      return spdl(song.url);
    } else { throw new Error(`Unknown song type '${song.type}'.`); }
  }
}
