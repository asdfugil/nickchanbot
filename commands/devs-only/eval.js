require('dotenv').config()
const Discord = require("discord.js");
const fs = require("fs");
const { prefixes } = require('../../sequelize')
const AniList = require("anilist-node")
const anilist = new AniList(process.env.ANILIST_TOKEN)
const ytdl = require("ytdl-core")
const os = require('os')
const youtubedl = require("youtube-dl-exec");
const tmp = os.tmpdir()
const fetch = require("node-fetch")
let { DEVS_ID } = process.env
DEVS_ID = DEVS_ID.split(',')
const { MessageAttachment, MessageEmbed, Permissions } = Discord;
const EventEmitter = require("events");
const names = require('people-names')
const util = require("util");
const ncbutil = require("../../modules/ncbutil.js");
const friendly_permissions = require("../../modules/friendly_permissions.js");
const Keyv = require("keyv");
const globalLogHooks = new Keyv('sqlite://.data/database.sqlite', { namespace: 'log-hooks' })
const parseTag = require("../../modules/parse-tag-vars.js")
const t = require('..')
module.exports = {
  args: true, //either boolean or number
  name: "eval",
  aliases: ["run", "execute"],
  cooldown: 0.1,
  description: { en: "Execute code (bot developers only)", zh: "運行程式碼（僅限開發者）" },
  usage: { en: "<code>" },
  translations: {
    error: {
      en: "error",
      zh: "錯誤"
    }
  },
  clean: text => {
    if (typeof text === "string")
      return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(process.env.YOUTUBE_KEY, "***************NICE TRY!*****************")
        .replace(process.env.BOT_TOKEN, "***************NICE TRY!*****************")
    else return text;
  },
  execute: async (message, args) => {
    if (!DEVS_ID.includes(message.author.id)) return;
    const fav = await message.client.users.fetch("400581909912223744", { headers: { "user-agent": process.env.USER_AGENT } })
    const reaction = await message.react("📝")
    try {
      const client = message.client;
      const code = args.join(" ");
      let evaled = await eval(code)
      if (typeof evaled !== "string") evaled = util.inspect(evaled, { depth: 2 });
      if (module.exports.clean(evaled).length < 1980)
        message.channel.send('```xl\n' + module.exports.clean(evaled) + '```');
      message.channel
        .send({ files: [new MessageAttachment(Buffer.from(module.exports.clean(evaled)),'result.log')] })
        .then(() => {
          reaction.remove();
          message.react("✅");
        })
        .catch(error => {
          message.channel.send(
            `\`${t('commands.eval.error', message.client, message.guild)}\` \`\`\`xl\n${module.exports.clean(error)}\n\`\`\``
          );
          reaction.remove();
          message.react("❌");
        });
    } catch (err) {
      message.channel.send(
        `\`${t('commands.eval.error', message.client, message.guild)}\` \`\`\`xl\n${module.exports.clean(err)}\n\`\`\``
      );
      reaction.remove();
      message.react("❌");
    }
  }
};
