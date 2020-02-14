const mutedRoles = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"muted-roles"})
const { noPermission,findRole } = require("../custom_modules/ncbutil.js")
const { RichEmbed } = require("discord.js")
const { setMutedRole } = require("../custom_modules/muted.js")
module.exports = {
  name:"set-muted-role",
  aliases:["muted-role"],
  cooldown:8,
  guildOnly:true,
  description:"Set the role to be used in the mute command",
  args:true,
  execute:async (message,args) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return noPermission("manage server",message.chnanel)
    if (args.join(" ") === 'none') return mutedRoles.delete(message.guild.id).then(() => message.reply("Removed muted role configuration"))
    const role = findRole(message,args.join(" "))
    if (!role) return message.reply("Unknown role")
    await mutedRoles.set(message.guild.id,role.id)
    const embed = new RichEmbed()
    .setColor("#00ff00")
    .setDescription(`The ${role.toString()} role will be used for the mute command. (Creating permission overwrites)`)
    message.channel.send(embed)
   await setMutedRole(role)
    message.channel.send("Successfully created permissions overwrites.")
  }
}