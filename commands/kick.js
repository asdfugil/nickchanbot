const {
  noPermission,
  noBotPermission,
  findMember
} = require("../custom_modules/ncbutil.js");
module.exports = {
  name: "kick",
  description: "kick members (under development)",
  args: true,
  guildOnly: true,
  usage: "<member> [reason]",
  execute: async (message, args) => {
    if (!message.member.hasPermission("KICK_MEMBERS"))
      return noPermission("kick members",message.channel)
    if (!message.guild.me.hasPermission("KICK_MEMBERS"))
      return noBotPermission("kick members",message.channel);
      findMember(message, args[0]).catch(error => {
        message.reply('Unknown member')
      })
    .then(member => {
      if ((member.highestRole.position - message.member.highestRole.position) >= 0)
        return message.reply(
          "No kicking someone that have a higher than or equal to role than you."
        );
      if (member.user.id === message.client.user.id)
        return message.reply("no u");
      if (member.id === message.member.id)
        return message.reply(
          "Why would you wanna kick yourself? I don't allow self harm."
        );
      if (member.id === message.guild.owner.id)
        return message.reply("You cannot kick the server owner!");
      if (
        (member.highestRole.position - message.guild.me.highestRole.position) >= 0
      )
        return message.reply(
          "The member's role hierarchy is higher than or equal to that of the bot,I cannot kick it!."
        );
      if (args.slice(1).join(" ") > 512)
        return message.reply(
          "Reason too long.Must be less than 512 characters"
        );
      if (!member.kickable) return message.reply("I cannot kick that member.");
      member
        .kick(`${message.author.tag} - ${args.slice(1).join(" ") || 'No reason given'}`)
        .then(() => {
        message.channel.send(`Successfully kicked ${member.user.tag}, reason: \`\`\`${args.slice(1).join(' ') || 'No reason given'}\`\`\``)
    })
      })
  }
};
