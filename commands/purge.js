const {
  noPermission,
  noBotPermission
} = require("../custom_modules/ncbutil.js");
const { Message } = require('discord.js')
module.exports = {
  name: "purge",
  aliases: ["prune", "clear", "bulkdelete", "bulk-delete"],
  description:
    "Mass delete messages,pinned messages will not be deleted.",
  guildOnly: true,
  args: 1,
  usage: "<integer>",
  info: "<integer> must be smaller than or equal to 1000.",
  /**
   * @param { Message } message
   * @param { Array<string> } args
   */
  execute: async (message, args) => {
    if (
      !message.channel
        .permissionsFor(message.member)
        .serialize().MANAGE_MESSAGES
    )
      return noPermission("Manage Messages", message.channel);
    if (
      !message.channel
        .permissionsFor(message.guild.me)
        .serialize().MANAGE_MESSAGES
    )
      //this method is from ../custom_modules/ncbutil.js
      return noBotPermission("Manage Messages", message.channel);
    const num = parseInt(args[0]);
    let rounded = Math.floor(num / 100) * 100;
    const diff = num - rounded;

    if (num > 1000 || num < 2)
      return message.reply(
        `Please use a value that's between 2 and 1000 inclusive`
      );
    let deletedMsgs = [];
    let notPinneda = [];
    const notify = await message.channel.send(`${message.client.emojis.get("704625871499296819")} Deleting messages...`)
    const fetcheda = await message.channel.fetchMessages({
      limit: diff,
      before: message.id
    });
    fetcheda.forEach(m => {
      if (!m.pinned) notPinneda.push(m);
    });
    const deleted = await message.channel.bulkDelete(notPinneda, {
      filterOld: true
    });
    await deleted.tap(m => deletedMsgs.push(m));
    while (rounded > 0) {
      let notPinned = [];
      const fetched = await message.channel.fetchMessages({
        limit: 100,
        before: message.id
      });
      fetched.forEach(m => {
        if (!m.pinned) notPinned.push(m);
      });
      const deleted = await message.channel.bulkDelete(notPinned, {
        filterOld: true
      });
      await deleted.tap(m => deletedMsgs.push(m));
      rounded -= 100;
    } 
    notify.edit(`✅ Deleted ${deletedMsgs.length} messages`)
  }
};
