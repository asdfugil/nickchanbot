const { exec } = require("child_process");
const Discord = require("discord.js");
const fs = require("fs");
const devsID = process.env.DEVS_ID.split(",")
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
  execute: async (message, args) => {
    if (!devsID.includes(message.author.id)) return;
    if (!args.join(" "))
      return message.reply("Please give the parameter to execute.");
    const mu = Date.now();
    const bashEmbed = new RichEmbed().setColor("#363A3F");
    exec(args.join(" "), async (error, stdout, stderr) => {
      if (stdout && stdout.length < 2010) {
        let output = `\`\`\`bash\n${stdout}\`\`\``;
        bashEmbed.setDescription(output);
      } else if (error) {
        bashEmbed.setColor("#FF0000");
        bashEmbed.setTitle("Error");
        let error = `\`\`\`bash\n${stderr}\`\`\``;
        if (error.length < 2048) bashEmbed.setDescription(error);
      } else {
        bashEmbed.setDescription(
          "```bash\n# Command executed successfully but returned no output.```"
        );
      }
      return message.channel.send("", {
        embed: bashEmbed.setFooter(`${Date.now() - mu}ms`),
        files:[new Attachment(Buffer.from(stdout || stderr,'utf8'),'output.log')]
      });
    });
  }
};
