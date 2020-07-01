const {
  noPermission,
  noBotPermission,
  findMember
} = require("../../custom_modules/ncbutil.js");
const { Message, GuildMember } = require('discord.js')
module.exports = {
  name: "setdeaf",
  guildOnly: true,
  args: 2,
  aliases: ["set-deaf", "deafen"],
  description: { en:"Deafen a member" },
  usage: { en:"<true|false> <member>" },
  cooldown: 3,
  /**
   * @param {Message} message 
   */
  execute: async (message, args) => {
    if (!["true", "false"].includes(args[0]))
      return message.reply(
        "Please use either `true` or `false` as the first argument."
      );
    findMember(message, args.slice(1).join(" "))
      .then(
        /**@param { GuildMember } member */
        member => {
        const { channel } = member.voice;
        if (!channel)
          return message.reply("The member is not in a voice channel.");
        if (!channel.permissionsFor(message.member).serialize().DEAFEN_MEMBERS)
          return noPermission("deafen members", message.channel);
        if (
          !channel.permissionsFor(message.guild.me).serialize().DEAFEN_MEMBERS
        )
          return noBotPermission("deafen members", message.channel);
      if (args[0] === "true") member.voice.setDeaf(true).then(member => message.channel.send("Successfully deafened " + member.user.tag +"."))
       else if (args[0] === "false") member.voice.setDeaf(false).then(member => message.channel.send("Successfully undeafened " + member.user.tag + "."))
      })
      .catch(error => {
        if (error.code === 10007) return message.reply("Unknown member.");
        else if (error.code === 10013) return message.reply("Unknown user.");
        else throw error;
      });
  }
};
