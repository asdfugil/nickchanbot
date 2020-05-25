const { postLog } = require("../custom_modules");
const parsePerm = require("../custom_modules/friendly_permissions.js");
const { Permissions } = require("discord.js");
module.exports = {
  name:"roleCreate",
  logged: "when a role is created",
  async execute(role) {
    postLog("roleCreate", role.guild, embed => {
      const permissions = new Permissions(role.permissions).serialize();
      const read = [];
      for (const key of Object.keys(permissions)) {
        read.push(`**${parsePerm(key)}:** ${permissions[key]}`);
      }
      embed
        .setTitle("Role Created")
        .setColor("#00ff00")
        .setAuthor(role.guild.name, role.guild.iconURL)
        .setTimestamp(role.createdTimestamp)
        .setFooter(role.client.user.tag, role.client.user.displayAvatarURL)
        .addField("Name", role.toString())
        .addField("ID", role.id)
        .addField("Mentionable", role.mentionable)
        .addField("Hoisted", role.hoist)
        .addField("Hex Colour", role.hexColor)
        .addField("Position", role.position)
        .addField("Auto-Managed", role.managed)
        .addField("Permissions", read.join("\n"));
    });
  }
};
