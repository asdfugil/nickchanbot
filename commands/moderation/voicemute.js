const {
  noPermission,
  noBotPermission,
  findMember
} = require("../../modules/ncbutil.js");
module.exports = {
  name: "voicemute",
  guildOnly: true,
  args: 2,
  aliases: ["set-mute", "voice-mute"],
  description: {en:"Voice mute a member"},
  usage: {en:"<true|false> <member>"},
  cooldown: 3,
  voiceChannel:(message,args) => { 
    const member = findMember(message, args.slice(1).join(" "))
    return member ? null : member.voice.channel
  },
  clientPermissions:['MUTE_MEMBERS'],
  execute: async (message, args) => {
    if (!["true", "false"].includes(args[0]))
      return message.reply(
        "Please use either `true` or `false` as the first argument."
      );
    findMember(message, args.slice(1).join(" "))
      .then(member => {
        const channel = member.voice.channel;
        if (!channel)
          return message.reply("The member is not in a voice channel.");
        if (!channel.permissionsFor(message.member).serialize().MUTE_MEMBERS)
          return noPermission("mute members", message.channel);
      if (args[0] === "true") member.voice.setMute(true).then(member => message.channel.send("Successfully voice-muted " + member.user.tag +"."))
       else if (args[0] === "false") member.voice.setMute(false).then(member => message.channel.send("Successfully voice-unmuted " + member.user.tag + "."))
      })
      .catch(error => {
        if (error.code === 10007) return message.reply("Unknown member.");
        else if (error.code === 10013) return message.reply("Unknown user.");
        else throw error;
      });
  }
};
