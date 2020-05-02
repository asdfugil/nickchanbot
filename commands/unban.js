const {
  noPermission,
  noBotPermission,
  findBannedUser
} = require("../custom_modules/ncbutil.js");
module.exports = {
  name: "unban",
  cooldown: 3,
  guildOnly: true,
  args: true,
  description: "unbans a user",
  usage: "<user> [reason]",
  execute: async (message, args) => {
    if (!message.member.hasPermission("BAN_MEMBERS"))
      return noPermission("kick members", message.channel);
    if (!message.guild.me.hasPermission("BAN_MEMBERS"))
      return noBotPermission("kick members", message.channel);
    let user = await findBannedUser(message, args[0]);
    if (!user) return message.reply("unknown user.");
    const reason = args.slice(1).join(" ");
    if (!reason) reason = "No reason given";
    if (reason.length > 472)
      return message.reply("Reason too long.Must be less than 472 characters");
    message.guild.unban(user,`${message.author.tag} - $[reason}`)
    .then(u => message.reply(`Successfully unbanned ${user.tag}, reason:${reason}`))
  }
};
