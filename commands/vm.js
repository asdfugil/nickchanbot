const { VM } = require("vm2");
const util = require("util");
const { Attachment } = require("discord.js");
const fs = require("fs");
module.exports = {
  name: "vm",
  cooldown: 5,
  aliases:[">"],
  description: "execute code in a sandbox",
  usage: "<code>",
  args: true,
  clean: text => {
    if (typeof text === "string")
      return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
  },
  execute: async (receivedMessage, args) => {
    const reaction = await receivedMessage.react("📝");
    try {
      const client = receivedMessage.client;
      const code = args.join(" ");
      let evaled = await new VM({
        timeout: 5000,
        wasm: false,
        eval: false
      }).run(args.join(" "));

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
