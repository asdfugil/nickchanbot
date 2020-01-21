const Keyv = require("keyv");
const { noPermission } = require("../custom_modules/ncbutil.js");
const prefix = require('../config/config.js')
const prefixs = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "prefixs"
});
module.exports = {
  name: "prefix",
  usage: "<new prefix>",
  args: 1,
  guildOnly: true,
  cooldown:60,
  description: "Sets a new prefix",
  info:'Don\'t set prefixs that begins with a whitespace,otherwise you cannot use the bot anymore.',
  execute: async (message, args) => {
    let actualPrefix = prefix;
    if (message.guild) {
      if (await prefixs.get(message.guild.id))
        actualPrefix = await prefixs.get(message.guild.id);
    }
    if (!message.member.hasPermission("MANAGE_GUILD"))
      return noPermission("Manage Server", message.channel);
    if (message.content.slice(actualPrefix.length + 7).startsWith(" ")) return message.reply('No setting prefixs that begins with a whitespace,otherwise you cannot use the bot anymore.')
    await prefixs.set(message.guild.id, message.content.slice(actualPrefix.length + 7));
    message.channel.send(`Prefix set to \`${message.content.slice(actualPrefix.length + 7)}\``);
  }
};
