require("dotenv").config();
const { YTSearcher } = require("ytsearcher");
const { noBotPermission } = require("../../custom_modules/ncbutil.js");
const ytdl = require("ytdl-core");
const searcher = new YTSearcher({ key: process.env.YOUTUBE_KEY });
const t = require('..')
const { spawn } = require('child_process')
const { Message, Collection } = require('discord.js')
module.exports = {
  name: "play",
  guildOnly: true,
  args: 1,
  userPermissions: ['CONNECT'], // PermissionsResolvable that can be handled by discord.js
  clientPermissions: ['CONNECT', "SPEAK"], // Note: voice permissions are not checked.
  translations: {
    please_connect: {
      en: "You must be connected to a voice channel to play music!"
    },
    the_same_channel: {
      en: "You must be connected to the channel I am playing music in to play music"
    },has_been_added:{
      en:" has been added to the queue"
    }
  },
  cooldown: 2,
  /**
   * @param { Message } message
   * @param { Array<string> } args
   */
  async execute(message, args) {
    const c = message.client
    const g = message.guild
    const { /**@type { Collection<string,any> }*/queue } = c
    if (!message.member.voice.channel) return message.channel.send(t('commands.play.please_connect', c, g))
    const channel = queue.channel || message.member.voice.channel
    if (channel.id !== message.member.voice.channel.id) return message.channel.send('commands.play.the_same_channel', c, g)
    if (!channel.permissionsFor(message.guild.me).has(17826816)) return noBotPermission(`${t('permissions.SPEAK', c, g)},${t('permissions.CONNNECT', c, g)}`)
    const result = (await searcher.search(args.join(" "))).first;
    if (!result) return message.reply("No results");
    const songInfo = await ytdl.getInfo(result.url); //stops here
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };
    if (!queue.get(message.guild.id)) {
      queue.set(message.guild.id, {
        text_channel: message.channel,
        voice_channel: channel,
        handler: spawn('/home/nick/nickchandev-server-v12-rewrite/custom_modules/music_processing.js'),
        connection: null,
        songs: [],
        volume: 1,
        is_looping: false,
        playing: true
      });
      try {
        const serverQueue = queue.get(message.guild.id)
        const connection = await channel.join()
        serverQueue.connection = connection
        module.exports.play(serverQueue.songs[0])
      } catch (error) {
        queue.delete(message.guild.id);
        throw error
      }
    } else {
      queue.get(message.guild.id).songs.push(song);
      return message.channel.send(`${song.title}${t('commands.play.has_been_added',c,g)}`);
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
    handler.send(JSON.stringify({ // Send a message to the child process
      type:'play',
      payload:{
        url:song.url
      }
    }))
    const dispatcher = serverQueue.connection.play(handler.stdout)
    .on("end", () => {
      if (serverQueue.looping !== "song") {
        if (serverQueue.looping === "queue") serverQueue.songs.push(serverQueue.songs[0]);
        serverQueue.songs.shift();
      }
      module.exports.play(message, serverQueue.songs[0]);
    })
    .on("error", error => {
      console.error(error);
    });
  }
}
/*
module.exports = {
  name: "play",
  description: "plays music",
  guildOnly: true,
  aliases:["p"],
  usage:"<search query or youtube url>",
  args: true,
  cooldown: 2,
  \/**
   * @param { Message } message
   * @param { Array<string> } args
   *\/
  execute: async (message, args) => {
    const { queue } = message.client;
    const serverQueue = queue.get(message.guild.id);
    const { channel } = message.member.voice
    if (!channel)
      return message.reply("You must be in a voice channel to play music!");
    const { CONNECT, SPEAK } = channel
      .permissionsFor(message.guild.me)
      .serialize();
    if (!CONNECT || !SPEAK)
      return noBotPermission("connect and speak", message.channel);
    const result = (await searcher.search(args.join(" "))).first;
    if (!result) return message.reply("No results");
    const songInfo = await ytdl.getInfo(result.url); //stops here
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };
    console.log(song)
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
      .play(ytdl(song.url, { options: ["lowestvideo", "highestaudio"] }),{passes:2})
      //2 times
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
*/
