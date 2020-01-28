require('dotenv').config()
const Discord = require("discord.js");
const fs = require("fs");
let { DEVS_ID } = process.env
DEVS_ID = DEVS_ID.split(',')
const { Attachment, RichEmbed, Permissions } = Discord;
const EventEmitter = require("events");
const names = require('people-names')
const util = require("util");
const ncbutil = require("../custom_modules/ncbutil.js");
const friendly_permissions = require("../custom_modules/friendly_permissions.js");
const Keyv = require("keyv");
const globalLogHooks = new Keyv('sqlite://.data/database.sqlite',{namespace:'log-hooks'})
const ranks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "ranks"
});
const prefixs = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "prefixs"
});
const mutedRoles = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "muted-roles"
});
const mutedMembers = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "muted-members"
});
module.exports = {
  args: true, //either boolean or number
  name: "eval",
  aliases: ["run", "execute"],
  cooldown: 0.1,
  description: "Execute code (bot developers only)",
  usage: "<code>",
  clean: text => {
    if (typeof text === "string")
      return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
  },
  execute: async (receivedMessage, args) => {
    if (!DEVS_ID.includes(receivedMessage.author.id)) return;
     const reaction = await receivedMessage.react("📝");
    try {
      const client = receivedMessage.client;
      const code = args.join(" ");
      let evaled = await eval(code)
  
          if (typeof evaled !== "string") evaled = util.inspect(evaled);

          if (module.exports.clean(evaled).length < 1980)
            receivedMessage.channel.send(module.exports.clean(evaled), {
              code: "xl"
            });
          fs.writeFileSync("../tmp/result.log", module.exports.clean(evaled));
          receivedMessage.channel
            .send(new Attachment("../../tmp/result.log"))
            .then(() => {
              reaction.remove();
              receivedMessage.react("✅");
            })
            .catch(error => {
              receivedMessage.channel.send(
                `\`ERROR\` \`\`\`xl\n${module.exports.clean(error)}\n\`\`\``
              );
              reaction.remove();
              receivedMessage.react("❌");
            });
    } catch (err) {
      receivedMessage.channel.send(
        `\`ERROR\` \`\`\`xl\n${module.exports.clean(err)}\n\`\`\``
      );
      reaction.remove();
      receivedMessage.react("❌");
    }
  }
};
