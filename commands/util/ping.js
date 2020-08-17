const Keyv = require("keyv")
const { performance } = require("perf_hooks")
const ping = new Keyv("sqlite://.data/database.sqlite", { namespace: "ping" })
const t = require("../../t")
module.exports = {
  name: 'ping',
  description: { en: 'returns latency' },
  aliases: ['pong'],
  cooldown: 3,
  translations: {
    pinging: {
      en: "Pinging...",
      zh:"量度中......"
    },
    pong: {
      en: `
      PONG!`,
      zh:"乓！"
    },
    round_trip: {
      en: "Message round trip",
      zh:"訊息來回時間"
    },
    heartbeat:{
      en:"Discord API heartbeat",
      zh:"Discord API 心跳"
    },
    db_read:{
      en:"Database (read)",
      zh:"數據庫讀取速度"
    },
    db_write:{
      en:"Database (write)",
      zh:"數據庫寫入速度"
    }
  },
  execute: async function (message, args) {
    const { client } = message
    message.channel.send(t("commands.ping.pinging", client,message.guild)).then(async m => {
      await ping.get("test")
      m.edit(`
              ========${t("commands.ping.pong", client,message.guild)}=========
• ${t("commands.ping.round_trip", client,message.guild)}                        :: ${Math.round(Date.now() - m.createdTimestamp)} ms 
• ${t('commands.ping.heartbeat', client,message.guild)}               :: ${Math.round(message.client.ws.ping)} ms`,
        { code: "asciidoc" }
      );
    });
  }
}