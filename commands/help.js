const prefix = process.env.PREFIX;
const Keyv = require("keyv");
const prefixs = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "prefixs"
});
const { Message } = require('discord.js')
module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command.",
  aliases: ["commands","man"],
  usage: "[command name]",
  cooldown: 5,
  execute: async (message, args) => {
    let actualPrefix = prefix;
    if (message.guild) {
      if (await prefixs.get(message.guild.id))
        actualPrefix = await prefixs.get(message.guild.id);
    }
    const data = [];
    const { commands } = message.client;

    if (!args.length) {
      data.push("**Command count:** " + commands.size);
      data.push("Here's a list of all my commands:");
      data.push(
        commands
          .map(command => {
           if (!command.hidden) return "`" +
              command.name +
              "` -- " +
              (command.description || "**Documentation missing.**")
            else return "*(hidden command placeholder)*"
          })
          .join("\n")
      );
      data.push(
        `\nYou can send \`${actualPrefix}help [command name]\` to get info on a specific command!`
      );
      return message.channel.send(data, { split: true, disableEveryone: true });
    }
    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply("that's not a valid command!");
    }

    data.push(`**Name:** ${command.name}`);

    if (command.aliases)
      data.push(`**Aliases:** ${command.aliases.join(", ")}`);
    if (command.description)
      data.push(`**Description:** ${command.description}`);
    if (command.usage)
      data.push(`**Usage:** ${actualPrefix}${command.name} ${command.usage}`);
    if (command.nsfw) data.push("**NSFW:** " + command.nsfw);
    if (command.cooldown)
      data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
    if (command.info) data.push(`**Additional Info:**${command.info}`);
    message.channel.send(data, { split: true });
  }
};
