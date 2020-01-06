const Discord = require("discord.js");
const fs = require("fs");
const config = require("../config/config.js");
const { Attachment, RichEmbed, Permissions } = Discord;
const EventEmitter = require("events");
const util = require("util");
const ncbutil = require("../custom_modules/ncbutil.js");
const friendly_permissions = require("../custom_modules/friendly_permissions.js");
const Keyv = require('keyv')
const ranks = new Keyv("sqlite://.data/database.sqlite",{namespace:'ranks'})
module.exports = {
  args:true, //either boolean or number
  name: "eval",
  aliases: ["run", "execute"],
  cooldown: 0.1,
  description:"Execute code (bot developers only)",
  usage:"<code>",
  clean: text => {
    if (typeof text === "string")
      return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
  },
  execute: async (receivedMessage, args) => {
    const reaction = await receivedMessage.react("📝")
    if (!config.devsID.includes(receivedMessage.author.id)) return;
    try {
      const client = receivedMessage.client
      const code = args.join(" ");
      let evaled = await eval(code);

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
