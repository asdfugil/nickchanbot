const { exec } = require("child_process");
const Discord = require("discord.js");
const fs = require("fs");
const config = require("../config/config.js");
const { Attachment, RichEmbed, Permissions } = Discord;
const EventEmitter = require("events");
const util = require("util");
const ncbutil = require("../custom_modules/ncbutil.js");
const friendly_permissions = require("../custom_modules/friendly_permissions.js");
module.exports = {
  args: true, //either boolean or number
  name: "exec",
  aliases: ["$", "bash"],
  cooldown: 0.1,
  description: "Run bash or command on terminal (bot developers only)",
  usage: "<terminal-command>",
  execute: async (receivedMessage, args) => {
    if (!config.devsID.includes(receivedMessage.author.id)) return;
    if (!args.join(" "))
      return receivedMessage.reply("Please give the parameter to execute.");
    const mu = Date.now();
    const bashEmbed = new RichEmbed().setColor("#363A3F");
    exec(args.join(" "), async (error, stdout, stderr) => {
      if (stdout) {
        let output = `\`\`\`bash\n${stdout}\`\`\``;
        if (stdout.length > 2047) {
          output = await fs.writeFileSync("../tmp/result.log", stdout);
        }
        bashEmbed.setDescription(output);
      } else if (stderr) {
        bashEmbed.setColor("#FF0000");
        bashEmbed.setTitle("Error");
        let error = `\`\`\`bash\n${stderr}\`\`\``;
        if (stderr.length > 2047) {
          error = await fs.WriteFileSync("../tmp/result.log", stderr);
        }
        bashEmbed.setDescription(error);
      } else {
        bashEmbed.setDescription(
          "```bash\n# Command executed successfully but returned no output.```"
        );
      }
      return receivedMessage.channel.send("", {
        embed: bashEmbed.setFooter(`${Date.now() - mu}ms`),
        files:[new Attachment('../tmp/result.log')]
      });
    });
  }
};
