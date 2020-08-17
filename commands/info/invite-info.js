 const { MessageEmbed } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
  name: "invite-info",
  aliases: ["inviteinfo"],
  description: "Show information about a discord invite",
  args: true,
  usage: "<invite>",
  execute: async (message, args) => {
    message.channel.startTyping();
      message.client
        .fetchInvite(args.join(" "))
        .then(async invite => {
          const embed = new MessageEmbed()
            .setTitle(invite.guild?.name || invite.channel?.name)
            .setURL(`https://discord.gg/${invite.code}`)
            .addField("code", invite.code)
            if (invite.guild) embed.addField(
              "Target server info",
              `name:${invite.guild.name}
id:${invite.guild.id}
icon hash (if any):${invite.guild.icon}
splash hash (if any):${invite.guild.splash}`
            );
          if (invite.guild?.icon) embed.setThumbnail(invite.guild.iconURL());
          if (invite.channel?.icon) embed.setThumbnail(invite.channel?.iconURL())
          if (invite.channel)
            embed.addField(
              "Target channel info",
              `name:${invite.channel.name}
id:${invite.channel.id}
type:${invite.channel.type}`
            );
          if (invite.inviter)
            embed.addField(
              "Inviter info",
              `Tag:${invite.inviter.tag}
Is Bot:${invite.inviter.bot}
Avatar:${invite.inviter.displayAvatarURL()}
User ID:${invite.inviter.id}
`
            );
          if (invite.url) embed.addField("URL", invite.url);
          if (invite.createdAt && invite.createdAt != "Invalid Date")
            embed.addField("Created At", invite.createdAt);
          if (invite.maxAge)
            embed.addField(
              "Maximum age",
              moment
                .duration(invite.maxAge * 1000)
                .format("D [day], H [hours], m [minutes], s [seconds]")
            );
          if (invite.temporary === true || invite.temporary === false)
            embed.addField("Is Temporary", invite.temporary);
          if (invite.maxUses) embed.addField("Maximum uses", invite.maxUses);
          if (invite.expiresAt && invite.expiresAt != "Invalid Date")
            embed.addField("Expires at", invite.expiresAt);
          if (invite.uses) embed.addField("Uses", invite.uses);
          if (invite.presenceCount)
            embed.addField("Members online", invite.presenceCount);
          if (invite.memberCount)
            embed.addField("Total Members", invite.memberCount);
              message.channel
                .send("", {
                  embed: embed
                })
                .then(() => message.channel.stopTyping());
        })
        .catch(error => {
          console.error(error)
          if (error.code === 40007)
            message.reply("The bot is banned from that server.");
          else message.reply("That's not a valid invite.");
          message.channel.stopTyping();
        });
  }
}