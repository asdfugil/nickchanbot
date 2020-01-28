const { Permissions } = require("discord.js");
const mutedRoles = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "muted-roles"
});
const mutedMembers = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "muted-members"
});
module.exports = {
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
  mutedTimers: client => {
    setInterval(() => {
      client.guilds.forEach(async guild => {
        if (!await mutedRoles.get(guild.id)) return
        const members = await mutedMembers.get(guild.id);
        if (!members) return
        Object.keys(members).forEach(key => {
          if (members[key]) {
            if (members[key] - Date.now() > 0) return
            guild.fetchMembers(members[key])
            .catch(console.error)
            .then(async member => {
              if (!member) return
              if (!member.removeRole) return
              const role = guild.roles.get(await mutedRoles.get(guild.id))
              if (!role) return
              member.removeRole(role,"Automatic Un-mute")
            })
          }
        })
      });
    }, 1000);
  }
};
