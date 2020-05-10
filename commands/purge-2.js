const {
  noPermission,
  noBotPermission
} = require("../custom_modules/ncbutil.js");
const { Message } = require("discord.js");
let delete_count = 0;
async function deletes(count, message) {
  console.log(count);
  if (count <= 100) {
    console.log(1);
    return message.channel
      .fetchMessages({ limit: count })
      .then(messages => messages.filter(msg => !msg.isPinned))
      .then(unpinned => message.channel.bulkDelete(unpinned))
      .then(deleted =>
        message.channel.send(`Deleted ${deleted.size + delete_count} messages`)
      );
  } else {
    console.log(2);
    const messages = await message.channel.fetchMessages({ limit: 100 });
    const unpinned = await messages.filter(msg => !msg.isPinned);
    console.log(unpinned.size)
    const deleted = await message.channel.bulkDelete(unpinned.keys()).catch(console.error)
    console.log(3)
    delete_count += deleted.size;
    count -= deleted.size;
    await deletes(count, message);
  }
}
module.exports = {
  name: "purge-2",
  aliases: ["prune", "clear", "bulkdelete", "bulk-delete"],
  description: "Mass delete messages,pinned messages will not be deleted.",
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
      !message.channel.permissionsFor(message.member).serialize()
        .MANAGE_MESSAGES
    )
      return noPermission("Manage Messages", message.channel);
    if (
      !message.channel.permissionsFor(message.guild.me).serialize()
        .MANAGE_MESSAGES
    )
      //this method is from ../custom_modules/ncbutil.js
      return noBotPermission("Manage Messages", message.channel);
    const count = parseInt(args[0]);
    if (isNaN(count)) return message.reply("That's not a valid number!");
    if (count < 2 || count > 1000)
      return message.reply("<integer> must be between 2 and 1000");
    deletes(count, message);
  }
};
