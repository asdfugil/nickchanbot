const {
  noPermission,
  noBotPermission
} = require("../custom_modules/ncbutil.js");
module.exports = {
  name: "purge",
  aliases: ["prune", "clear", "bulkdelete", "bulk-delete"],
  description:
    "Mass delete messages,pinned messages will not be deleted.",
  guildOnly: true,
  args: 1,
  usage: "<integer>",
  info: "<integer> must be smaller than or equal to 1000.",
  execute: async (receivedMessage, args) => {
    if (
      !receivedMessage.channel
        .permissionsFor(receivedMessage.member)
        .serialize().MANAGE_MESSAGES
    )
      return noPermission("Manage Messages", receivedMessage.channel);
    if (
      !receivedMessage.channel
        .permissionsFor(receivedMessage.guild.me)
        .serialize().MANAGE_MESSAGES
    )
      //this method is from ../custom_modules/ncbutil.js
      return noBotPermission("Manage Messages", receivedMessage.channel);
    const num = parseInt(args[0]);
    let rounded = Math.floor(num / 100) * 100;
    const diff = num - rounded;

    if (num > 999 || num < 2)
      return receivedMessage.reply(
        `Please use a value that's between 2 and 999 inclusive`
      );
    let deletedMsgs = [];
    let notPinneda = [];
    const notify = await receivedMessage.channel.send(`${receivedMessage.client.emojis.get("663337946027524108").toString()} Deleting messages...`)
    const fetcheda = await receivedMessage.channel.fetchMessages({
      limit: diff,
      before: receivedMessage.id
    });
    fetcheda.forEach(m => {
      if (!m.pinned) notPinneda.push(m);
    });
    const deleted = await receivedMessage.channel.bulkDelete(notPinneda, {
      filterOld: true
    });
    await deleted.tap(m => deletedMsgs.push(m));
    while (rounded > 0) {
      let notPinned = [];
      const fetched = await receivedMessage.channel.fetchMessages({
        limit: 100,
        before: receivedMessage.id
      });
      fetched.forEach(m => {
        if (!m.pinned) notPinned.push(m);
      });
      const deleted = await receivedMessage.channel.bulkDelete(notPinned, {
        filterOld: true
      });
      await deleted.tap(m => deletedMsgs.push(m));
      rounded -= 100;
    } 
    notify.edit(`✅ Deleted ${deletedMsgs.length} messages`)
  }
};
