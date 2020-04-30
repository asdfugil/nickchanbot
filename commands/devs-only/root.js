require('dotenv').config()
const { exec } = require("child_process");
const Discord = require("discord.js");
const fs = require("fs");
const devsID = process.env.DEVS_ID.split(",")
const { MessageAttachment, MessageEmbed, Permissions } = Discord;
const EventEmitter = require("events");
const util = require("util");
const ncbutil = require("../../custom_modules/ncbutil.js");
const friendly_permissions = require("../../custom_modules/friendly_permissions.js");
module.exports = {
  args: true, //either boolean or number
  name: "root",
  aliases: ["#","sudo"],
  cooldown: 0.1,
  description: "Run bash or command on terminal as root (bot developers only)",
  usage: "<terminal-command>",
  execute: async (message, args) => {
    if (!devsID.includes(message.author.id)) return;
   const mu = Date.now()
   exec(`echo "${process.env.PASS}" | sudo -S ` + args.join(" "),(error,stdout,stderr) => {
     const time = Date.now() - mu
     const embed = new MessageEmbed()
      if (stdout) {
        fs.writeFileSync("/tmp/stdout.log",stdout)
          embed
          .setColor("#00ff00")
          .setTitle("Output")
          .setDescription("```bash\n" + message.client.commands.get("eval").clean(stdout)+"```")
          .setFooter(`${time}ms`)
          .attachFiles(["/tmp/stdout.log"])
          return message.channel.send(embed)
      } else if (stderr) {
        fs.writeFileSync("/tmp/stderr.log",stdout)
        embed
        .setColor("#ff0000")
        .setTitle("Error")
        .setDescription("```bash\n" + message.client.commands.get("eval").clean(stdout)+"```")
        .setFooter(`${time}ms`)
        .attachFiles(["/tmp/stderr.log"])
        return message.channel.send(embed)
      } else {
        embed
        .setColor("#00ff00")
        .setTitle("Output")
        .setDescription("```bash\n# Command executed successfully but returned no output```")
        .setFooter(`${time}ms`)
        .attachFiles(["/tmp/stdout.log"])
        return message.channel.send(embed)
      }
   })
  }
};
