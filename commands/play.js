require("dotenv").config();
const { YTSearcher } = require("ytsearcher");
const { noBotPermission } = require("../custom_modules/ncbutil.js");
const ytdl = require("ytdl-core");
const searcher = new YTSearcher({ key: process.env.YOUTUBE_KEY });
module.exports = {
  name: "play",
  description: "plays music",
  guildOnly: true,
  aliases:["p"],
  usage:"<search query or youtube url>",
  args: true,
  cooldown: 2,
  execute: async (message, args) => {
    const { queue } = message.client;
    const serverQueue = queue.get(message.guild.id);
    const channel = message.member.voiceChannel;
    if (!channel)
      return message.reply("You must be in a voice channel to play music!");
    const { CONNECT, SPEAK } = channel
      .permissionsFor(message.guild.me)
      .serialize();
    if (!CONNECT || !SPEAK)
      return noBotPermission("connect and speak", message.channel);
    const result = (await searcher.search(args.join(" "))).first;
    if (!result) return message.reply("No results");
    const songInfo = await ytdl.getInfo(result.url);
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: channel,
        connection: null,
        songs: [],
        volume: 1,
        playing: true,
        looping: false
      };

      queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        const connection = await channel.join();
        queueContruct.connection = connection;
        module.exports.play(message, queueContruct.songs[0]);
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
  play(message, song) {
    const guild = message.guild;
    const { queue } = message.client;
    const serverQueue = queue.get(message.guild.id);

    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
      .playStream(ytdl(song.url, { options: ["lowestvideo", "highestaudio"] }),{passes:10})
      //3 times
      //Youtube intentionally rate limkt audio only downloads,so we use the worst video quality as possible instead of audio only
      .on("end", () => {
        console.log("Music ended!");
        if (serverQueue.looping !== "song") {
          if (serverQueue.looping === "queue") serverQueue.songs.push(serverQueue.songs[0]);
          serverQueue.songs.shift();
        }
        module.exports.play(message, serverQueue.songs[0]);
      })
      .on("error", error => {
        console.error(error);
      });
    message.channel.send(`Started playing ${song.title}.`);
    dispatcher.setVolume(serverQueue.volume);
  }
};
