const pidusage = require("pidusage");
const { RichEmbed, version } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
  name: "stats",
  aliases: ["statistics"],
  description: "Display bot statisics",
  cooldown: 20,
  execute: async (receivedMessage, args) => {   
    const client = receivedMessage.client;
    const duration = moment
      .duration(client.uptime)
      .format(" D [days], H [hrs], m [mins], s [secs]");
    const processDuration = moment
      .duration(process.uptume)
      .format(" D [days], H [hrs], m [mins], s [secs]");
    const servers = await client.shard.broadcastEval("this.guilds.size");
    const users = await client.shard.broadcastEval("this.users.size");
    const channels = await client.shard.broadcastEval("this.channels.size");
    const rssUsage = await client.shard.broadcastEval(
      "process.memoryUsage().rss/1024/1024"
    );
    const heapUsage = await client.shard.broadcastEval(
      "process.memoryUsage().heapUsed/1024/1024"
    );
    pidusage(process.pid,async (error,pidstats) => {
    const cpuUsage = await client.shard.broadcastEval(`
const util = require("util")
const pidusage = require("pidusage")
const p = util.promisify(pidusage)
const x = p(process.pid)
x.cpu
`)
    const statsEmbed = new RichEmbed()
      .setColor("#363A3F")
      .setAuthor("Statistics", "https://i.imgur.com/7hCWXZk.png")
      .setTitle(`${client.user.username}'s stats`)
      .setDescription(
        "Contains essential information regarding our service and bot information."
      )
      .setThumbnail(client.user.displayAvatarURL)
      .addField("Client Uptime", `${duration}`, true)
    .addField("Process Uptime",`${processDuration}`,true)
      .addField("Shards", `${client.shard.count}`, true)
      .addField(
        "Servers",
        `${servers.reduce((previous, count) => previous + count, 0)}`,
        true
      )
      .addField(
        "Channels",
        `${channels.reduce((previous, count) => previous + count, 0)}`,
        true
      )
      .addField(
        "Users",
        `${users.reduce((previous, count) => previous + count, 0)}`,
        true
      )
      .addField("Discord.js Version", `${version}`, true)
      .addField("NodeJS Version", `${process.version}`, true)
      .addField("Websocket Ping", `${Math.round(client.ping)}ms`, true)
      .addField(
        "Memory Usage",
        `${rssUsage
          .reduce((previous, count) => previous + count, 0)
          .toFixed(2)} MB RSS\n${heapUsage
          .reduce((previous, count) => previous + count, 0)
          .toFixed(2)} MB Heap`,
        true
      )
      .addField(
        "CPU Usage",
        `Node: ${(
          cpuUsage.reduce((previous, count) => previous + count, 0)
        ).toFixed(2)}%`
      )
      .setFooter(client.user.tag, client.user.displayAvatarURL);
    receivedMessage.channel.send(statsEmbed);
    })
  }
};
