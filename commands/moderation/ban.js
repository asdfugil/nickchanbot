const {
  noPermission,
  noBotPermission,
  findMember,
  findUser
} = require("../../custom_modules/ncbutil.js");
const { Message } = require('discord.js')
module.exports = {
  name: "ban",
  cooldown: 5,
  args: true,
  description: { en: "bans a user/member from the server" },
  guildOnly: true,
  usage: {en:"<user> [days delete] [reason]"},
  info:
      {en:"if [days delete] is not a integer from 0 to 7,then it will be interpreted as part of the reason."},
  /**
   * @param { Message } message
   */
    execute: async (message, args) => {
    if (!message.member.hasPermission("BAN_MEMBERS"))
      return noPermission("ban members", message.channel);
    if (!message.guild.me.hasPermission("BAN_MEMBERS"))
      return noBotPermission("ban members", message.channel);
    await findMember(message, args[0])
      .then(member => {
        if (
          member.roles.highest.position - message.member.roles.highest.position >=
          0
        )
          return message.reply(
            "No banning someone that have a higher than or equal to role than you."
          );
        if (member.user.id === message.client.user.id)
          return message.channel.send("no u");
        if (member.id === message.member.id)
          return message.reply(
            "Why would you wanna ban yourself? I don't allow self harm."
          );
        if (member.id === message.guild.owner.id)
          return message.reply("You cannot ban the server owner!");
        if (
          member.roles.highest.position - message.guild.me.roles.highest.position >=
          0
        )
          return message.reply(
            "The member's role hierarchy is higher than or equal to that of the bot,I cannot ban it!."
          );
        if (!member.bannable) return message.reply("I cannot ban that member.");
        let days = parseInt(args[1], 10);
        if (days > 7) days = 0;
        let reason;
        if (days.toString() !== args[1]) {
          reason = args.slice(1).join(" ");
          days = 0;
        } else {
          reason = args.slice(2).join(" ");
        }
        if (!reason) reason = "No reason given";
        if (reason.join(" ") > 472)
          return message.reply(
            "Reason too long.Must be less than 472 characters"
          );
        member.ban({
            days: days,
            reason: `${message.author.tag} - ${reason}`
          })
        .then(m => message.channel.send(`Successfully banned ${m.user.tag} \nReason:${reason}\ndays delete:${days}`))
      })
      .catch(async error => {
        const user = await findUser(message, args[0]).catch(error => {
          message.reply("Unknown user.")
        });
        if (!user) return
        let days = parseInt(args[1], 10);
        if (days > 7) days = 0;
        let reason;
        if (days.toString() !== args[1]) {
          reason = args.slice(1).join(" ");
          days = 0;
        } else {
          reason = args.slice(2).join(" ");
        }
        if (!reason) reason = "No reason given";
        if (reason.length > 472)
          return message.reply(
            "Reason too long.Must be less than 472 characters"
          )
        message.guild.members
          .ban(user.id, {
            days: days,
            reason: `${message.author.tag} - ${reason}`
          })
          .then(u =>
            message.channel.send(`Successfully banned ${u.tag || user} \nReason:${reason}\ndays delete:${days}`)
          );
      });
  }
};
