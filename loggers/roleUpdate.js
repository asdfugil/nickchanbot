const { postLog } = require('../custom_modules')
const { Permissions } = require('discord.js')
const parsePerm = require('../custom_modules/friendly_permissions.js')
module.exports = {
    name:'roleUpdate',
    logged:'when a role is updated',
    execute:(oldRole,newRole) => postLog('roleUpdate',newRole.guild,embed => {
        const oldPerms = new Permissions(oldRole.permissions).serialize();
        const newPerms = new Permissions(newRole.permissions).serialize();
        let changes = "None";
        let changesInPermission = new String("None");
        for (const [oldKey, oldValue] of Object.entries(oldRole)) {
          if (
            !["name", "mentionable", "hoist", "color", "position"].includes(
              oldKey
            )
          )
            continue;
          if (oldValue === newRole[oldKey]) continue;
          changes += `\n${oldKey}: ${oldValue} --> ${newRole[oldKey]}`;
        }
        for (const [oldPermsName, oldPermsValue] of Object.entries(oldPerms)) {
          if (oldPermsValue === newPerms[oldPermsName]) continue;
          changesInPermission += `\n${parsePerm.get(oldPermsName)}: ${oldPermsValue} --> ${newPerms[oldPermsName]}`;
        }
        if (!changesInPermission.endsWith("None"))
          changesInPermission = changesInPermission.substr(5);
        if (!changes.endsWith("None")) changes = changes.substr(5);
        if (changes.endsWith("None" && changesInPermission.endsWith("None"))) return 'BREAK'
        embed
          .setTitle(`Role "${oldRole.name}" Updated`)
          .setAuthor(newRole.guild.name, newRole.guild.iconURL)
          .setDescription(`${newRole.toString()}\n**Role ID** : ${newRole.id}`)
          .addField("Changes (expect permissions)", changes)
          .setColor("#b7eb34")
          .setTimestamp()
          .setFooter(newRole.client.user.tag, newRole.client.user.displayAvatarURL);
          if (!changes.endsWith("None")) embed.addField("Chnages in permissions", changesInPermission)
    })
}