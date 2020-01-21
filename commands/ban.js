const {
    noPermission,
    noBotPermission,
    findMember,
    findUser
  } = require("../custom_modules/ncbutil.js");
  module.exports = {
    name: "ban",
    cooldown: 5,
    args: true,
    descripton: "bans a user/member from the server",
    guildOnly: true,
    usage: "<user> [days delete] [reason]",
    info:
      "if [days delete] is not a integer from 0 to 7,then it will be interpreted as part of the reason.",
    execute: async (message, args) => {
      if (!message.member.hasPermission("BAN_MEMBERS"))
        return noPermission("kick members", message.channel);
      if (!message.guild.me.hasPermission("BAN_MEMBERS"))
        return noBotPermission("kick members", message.channel);
      const member = await findMember(message, args[0])
        .then(member => {
          if (
            member.highestRole.position - message.member.highestRole.position >=
            0
          )
            return message.reply(
              "No banning someone that have a higher role than you."
            );
          if (member.user.id === message.client.user.id)
            return message.reply("no u");
          if (member.id === message.member.id)
            return message.reply(
              "Why would you wanna ban yourself? I don't allow self harm."
            );
          if (member.id === message.guild.owner.id)
            return message.reply("You cannot ban the server owner!");
          if (
            member.highestRole.position - message.guild.me.highestRole.position >=
            0
          )
            return message.reply(
              "The member's role hierarchy is higher than that of the bot,I cannot ban it!."
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
          if (reason.join(" ") > 512)
            return message.reply(
              "Reason too long.Must be less than 512 characters"
            );
          member.ban({
              days: days,
              reason: `${message.author.tag} - ${reason}`
            })
          .then(m => message.channel.send(`Successfully banned ${m.user.tag} \nReason:${reason}\ndays delete:${days}`))
        })
        .catch(async error => {
          const user = findUser(message, args[0]).catch(error =>
            message.reply("Unknown user.")
          );
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
          if (reason.join(" ") > 512)
            return message.reply(
              "Reason too long.Must be less than 512 characters"
            );
          message.guild
            .ban(user, {
              days: days,
              reason: `${message.author.tag} - ${reason}`
            })
            .then(u =>
              message.channel.send(`Successfully banned ${u.tag || user} \nReason:${reason}\ndays delete:${days}`)
            );
        });
    }
  };
  