const { MessageEmbed, GuildMember } = require("discord.js");
const { findMember } = require("../../modules/ncbutil.js");
module.exports = {
  name: "member-info",
  guildOnly: true,
  description: { en: "Shows information about a server member" },
  usage: { en: "[member resolvable]" },
  async execute(message, args) {
    /**@type { GuildMember } */
    let member;
    if (args[0]) {
      member = await findMember(message, args.join(" ")).catch(error => {
        member = message.member;
      });
    } else member = message.member;
    let roles = [...member.roles.cache].slice(0, 39).map(x => x.toString())
    if (member.roles.size > 40) roles += '...'
    const embed = new MessageEmbed()
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
      .addField("Roles", roles)
      .addField("Highest Role", member.roles.highest.toString())
      .setTimestamp()
      .setFooter(message.client.user.tag, message.client.user.displayAvatarURL());
    if (member.hoistRole)
      embed.addField("Hoist role", member.roles.hoist.toString());
    if (member.colorRole) embed.addField("Colour role", member.roles.color.toString());
    const voiceStatus = [];
    if (member.voice.channel) {
      voiceStatus.push("**Voice channel:** " + member.voice.channel.name);
      voiceStatus.push("**Voice Channel ID:** " + member.voice.channel.id);
      voiceStatus.push("**Is server-side voice muted:** " + member.voice.serverMute);
      voiceStatus.push("**Is server-side deafened:** " + member.voice.serverDeaf);
      voiceStatus.push("**Is self voice muted:** " + member.voice.selfMute);
      voiceStatus.push("**Is self deafened:** " + member.voice.selfDeaf);
      voiceStatus.push("**Voice session ID:** " + member.voice.sessionID);
      embed.addField("Voice Status", voiceStatus.join("\n"))
    } else embed.addField("Voice Status", "Not Connected")
    try {
      embed.addField("Status", member.presence.status);
      if (member.presence.game) {
        embed
          .addField("Playing", member.presence.game.name)
          .addField("Is streaming", member.presence.game.streaming)
          .addField("Stream URL", member.presence.game.url);
      }
    } catch (error) { }
    if (member.bot === false) {
      if (member.presence.status != "offline") {
        embed.addField('Using Discord on', Object.keys(member.presence.clientStatus).join(', ') || 'N/A')
      }
    }
    message.channel.send({ embeds: [embed] });
  }
};
