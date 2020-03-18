const { Permissions,Client } = require("discord.js");
const mutedRoles = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "muted-roles"
});
const mutedMembers = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "muted-members"
});
module.exports = {
  /**
   * Set overwrites for muted role
   * @param role - The muted role
   */
  setMutedRole: async role => {
    const permissions = new Permissions(role.permissions);
    permissions.remove("SEND_MESSAGES");
    role.setPermissions(permissions);
    await role.guild.channels.forEach(async channel => {
      await channel.overwritePermissions(
        role,
        { SEND_MESSAGES: false },
        "Muted Role"
      );
    });
  },
  /**
   * Create overwrites for muted role when a channel is created
   * @param client - The bot client
   */
  updateMutedRoles: client => {
    client.on("channelCreate", async channel => {
      if (!channel.guild) return;
      const role = channel.guild.roles.get(
        await mutedRoles.get(channel.guild.id)
      );
      if (!role) return;
      if (!channel.permissionsFor(channel.guild.me).serialize().MANAGE_ROLES)
        return;
      channel.overwritePermissions(
        role,
        { SEND_MESSAGES: false },
        "Muted Role"
      );
    });
  },
  /**
   * Unmuted members when times up
   * @param client - The bot client
   */
  mutedTimers: client => {
    setInterval(() => {
      client.guilds.cache.forEach(async guild => {
        const role_id = await mutedRoles.get(guild.id)
        if (!role_id) return
        const role = guild.roles.cache.get(role_id)
        if (!role) return
        const members = await mutedMembers.get(guild.id);
        if (!members) return
        for (const member_id of Object.keys(members)) {
          if ((members[member_id] - Date.now()) > 0) return
          if ((members[member_id] - Date.now()) === -1) return
          delete members[member_id]
          mutedMembers.set(guild.id,members)
          const user = await client.users.fetch(member_id)
          const member = guild.members.resolve(user)
          if (!member) return
          if (role.comparePositionTo(guild.me.highestRole) >= 0) return
          member.removeRole(role,"Automatic un-mute (times up)")
        }
      });
    }, 1000);
  },
  /**
  * @param { Client } client
  */
  autoReMute: client => {
    client.on("guildMemberAdd",async member => {
      const members = await mutedMembers.get(member.guild.id)
      if (!members[member.id]) return
      const role = member.guild.roles.cache.get(await mutedRoles.get(member.guild.id)||"abc")
      if (!role) return
      if (member.guild.me.highestRole.comparePositionTo(role) <= 0 || !member.guild.me.hasPermission("MANAGE_ROLES")) return
      member.addRole(role,"Automatic re-mute")
    })
  },
  autoUpdateDataBase: client => {
    client.on("memberUpdate",async (oldMember,newMember) => {
      const role = mutedRoles.get(newMember.guild.id)
      if (!role) return
      if (!oldMember.roles.has(role.id) || newMember.roles.has(role.id)) return
      const data = await mutedMembers.get(oldMember.guild.id)
      if (!data) return
      delete data[newMember.id]
      mutedMembers.set(newMember.guild.id,data)
    })
  }
};
