const { exec } = require("child_process");
const Discord = require("discord.js");
const fs = require("fs");
const devsID = process.env.DEVS_ID.split(",")
const { MessageAttachment, MessageEmbed, Permissions } = Discord;
const EventEmitter = require("events");
const util = require("util");
const ncbutil = require("../../modules/ncbutil.js");
const friendly_permissions = require("../../modules/friendly_permissions.js");
module.exports = {
  args: true, //either boolean or number
  name: "exec",
  aliases: ["$","bash"],
  cooldown: 0.1,
  description: {en:"Run bash or command on terminal (bot developers only)"},
  usage: {en:"<terminal-command>"},
  translations:{
    empty_output:{
      
    }
  },
  execute: async (message, args) => {
    if (!devsID.includes(message.author.id)) return;
   const mu = Date.now()
   exec(args.join(" "),(error,stdout,stderr) => {
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
          return message.channel.send({ embeds: [embed] })
      } else if (stderr) {
        fs.writeFileSync("/tmp/stderr.log",stdout)
        embed
        .setColor("#ff0000")
        .setTitle("Error")
        .setDescription("```bash\n" + message.client.commands.get("eval").clean(stdout)+"```")
        .setFooter(`${time}ms`)
        .attachFiles(["/tmp/stderr.log"])
        return message.channel.send({ embeds: [embed] })
      } else {
        embed
        .setColor("#00ff00")
        .setTitle("Output")
        .setDescription("```bash\n# Command executed successfully but returned no output```")
        .setFooter(`${time}ms`)
        .attachFiles(["/tmp/stdout.log"])
        return message.channel.send({ embeds: [embed] })
      }
   })
  }
};
