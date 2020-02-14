const { RichEmbed } = require("discord.js");
const { findMember } = require("../custom_modules/ncbutil.js");
module.exports = {
  name: "member-info",
  guildOnly: true,
  description: "Shows information about a server member",
  usage: "[member resolvable]",
  async execute(message, args) {
    let member;
    if (args[0]) {
      member = await findMember(message, args.join(" ")).catch(error => {
        member = message.member;
      });
    } else member = message.member;
    let roles = member.roles.array().slice(0,39).map(x => x.toString())
    if (member.roles.size > 40) roles += '...'
    const embed = new RichEmbed()
      .setTitle("Member Info")
      .setDescription(
        "Note:The only reliable way to use this command is by member ID."
      )
      .addField("User", member.user.toString())
      .addField("Member ID", member.id)
      .addField("Joined at", member.joinedAt)
      .addField("Permissions bitfield", member.permissions.bitfield)
      .addField("Display colour", member.displayHexColor)
      .setColor(member.displayHexColor)
      .addField("Display name", member.displayName)
      .addField("Roles",roles)
      .addField("Highest Role", member.highestRole.toString())
      .setTimestamp()
      .setFooter(message.client.user.tag, message.client.user.displayAvatarURL);
    if (member.hoistRole)
      embed.addField("Hoist role", member.hoistRole.toString());
    if (member.colorRole) embed.addField("Colour role", member.colorRole);
    const voiceStatus = [];
    if (member.voiceChannel) {
      voiceStatus.push("**Voice channel:**" + member.voiceChannel.name);
      voiceStatus.push("**Voice Channel ID:**" + member.voiceChannelID);
      voiceStatus.push("**Is server-side voice muted:**" + member.serverMute);
      voiceStatus.push("**Is server-side deafened:**" + member.serverDeaf);
      voiceStatus.push("**Is self voice muted:**" + member.selfMute);
      voiceStatus.push("**Is self deafened:**" + member.selfDeaf);
      voiceStatus.push("**Voice session ID:**" + member.voiceSessionID);
      embed.addField("Voice Status",voiceStatus.join("\n"))
    } else embed.addField("Voice Status","Not Connected")
    message.channel.send(embed);
  }
};
