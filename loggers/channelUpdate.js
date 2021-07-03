const {
  RichEmbed,
  WebhookClient,
  Permissions,
  GuildChannel,
  VoiceChannel,
  TextChannel,
  NewsChannel,
  StoreChannel
} = require("discord.js");
const Keyv = require("keyv");
const globalLogHooks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
const parsePerm = require("../custom_modules/friendly_permissions.js");
const { postLog } = require("../custom_modules");
module.exports = {
  name: "channelUpdate",
  logged: "when a channel is updated",
  /**
   * @param { GuildChannel | VoiceChannel | TextChannel | NewsChannel | StoreChannel } o
   * @param { GuildChannel | VoiceChannel | TextChannel | NewsChannel | StoreChannel } channel
   */
  async execute(o, channel) {
    postLog("channelUpdate", channel.guild, async embed => {
      const { displayAvatarURL, tag } = channel.client.user;
      embed
        .setTitle("Channel Updated")
        .setAuthor(channel.guild.name, channel.guild.iconURL)
        .setDescription(channel.toString())
        .setColor(0xb7ff00)
        .setFooter(tag, displayAvatarURL);
      const {
        name,
        nsfw,
        topic,
        hexColor,
        calculatedPosition,
        position,
        rateLimitPerUser,
        permissionOverwrites,
        guild,
        client
      } = channel;
      if (o.name !== name) embed.addField("Name", `${o.name} -> ${name}`);
      if (o.nsfw !== nsfw) embed.addField("Is NSFW", `${o.nsfw} -> ${nsfw}`);
      if (o.topic !== topic)
        embed
          .addField("Old topic", o.topic || "(none)")
          .addField("New topic", topic || "(none)");
      if (o.hexColor !== hexColor)
        embed.addField("Hex color", `${o.hexColor} -> ${hexColor}`);
      if (o.calaculatedPosition !== calculatedPosition)
        embed.addField(
          "Calaculated Position",
          `${o.calculatedPosition} -> ${calculatedPosition}`
        );
      if (o.position !== position)
        embed.addField(
          "Rate Limit Per User",
          `${o.rateLimitPerUsed}s -> ${rateLimitPerUser}s`
        );
      for (const [roleOrUserID, overWrite] of o.permissionOverwrites) {
        if (permissionOverwrites.get(roleOrUserID)) continue;
        const oldAllow = new Permissions(overWrite.allow);
        const oldDeny = new Permissions(overWrite.deny);
        const oldAllowed = [];
        const oldDenied = [];
        for (const key of Object.keys(oldAllow.serialize())) {
          if (oldAllow.serialize()[key] === true)
            oldAllowed.push(parsePerm.get(key));
        }
        for (const key of Object.keys(oldDeny.serialize())) {
          if (oldDeny.serialize()[key] === true)
            oldDeny.push(parsePerm.get(key));
        }
        let meaning;
        if (guild.roles.get(roleOrUserID)) guild.roles.get(roleOrUserID).name;
        else meaning = await client.fetchUser(roleOrUserID).then(u => u.tag);
        embed.addField(
          "Permission Overwrites: " + meaning,
          `**Allowed**:
${oldDenied.join(",") || "(none)"} -> (none)
**Denied**
${oldDenied.join(",") || "(none)"} -> (none)`
        );
      }
      for (const [roleOrUserID, overWrite] of permissionOverwrites) {
        const old = o.permissionOverwrites.get(roleOrUserID);
        let meaning;
        if (guild.roles.get(roleOrUserID)) guild.roles.get(roleOrUserID).name;
        else meaning = await client.fetchUser(roleOrUserID).then(u => u.tag);
        const newAllow = new Permissions(overWrite.allow);
        const newAllowed = [];
        const newDeny = new Permissions(overWrite.deny);
        const newDenied = [];
        for (const key of Object.keys(newAllow.serialize())) {
          if (newAllow.serialize()[key] === true)
            newAllowed.push(parsePerm.get(key));
        }
        for (const key of Object.keys(newDeny.serialize())) {
          if (newDeny.serialize()[key] === true)
            newDeny.push(parsePerm.get(key));
        }
        if (!old) {
          embed.addField(
            "Permission Overwrites: " + meaning,
            `**Allowed**:
(none) -> ${newAllowed.join(",") || "(none)"}
**Denied**
(none) -> ${newDenied.join(",") || "(none)"}`
          );
          continue;
        } else {
          const oldAllow = new Permissions(old.allow);
          const oldDeny = new Permissions(old.deny);
          const oldAllowed = [];
          const oldDenied = [];
          if (old.allow === overWrite.allow && old.deny === overWrite.deny)
            continue;
          for (const key of Object.keys(oldAllow.serialize())) {
            if (oldAllow.serialize()[key] === true)
              oldAllowed.push(parsePerm.get(key));
          }
          for (const key of Object.keys(oldDeny.serialize())) {
            if (oldDeny.serialize()[key] === true)
              oldDeny.push(parsePerm.get(key));
          }
          embed.addField(
            "Permission Overwrites: " + meaning,
            `**Allowed**:
${oldDenied.join(",") || "(none)"} -> ${newAllowed.join(",") || "(none)"}
**Denied**
${oldDenied.join(",") || "(none)"} -> ${newDenied.join("\n") || "(none)"}`
          );
          continue;
        }
      }
    });
  }
};
