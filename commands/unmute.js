const Keyv = require('keyv') 
const { Message } = require('discord.js')
const {
  noPermission,
  noBotPermission,
  findMember
} = require("../custom_modules/ncbutil.js");
const { RichEmbed, GuildMember } = require("discord.js");
/**
 * @type { Keyv<string> } 
 */
const mutedRoles = new Keyv('sqlite://.data/database.sqlite',{namespace:'muted-roles'})
/**
 * @type { Keyv<string> } 
 */
const mutedMembers = new Keyv('sqlite://.data/database.sqlite',{namespace:'muted-members'})
module.exports = {
    name:'unmute',
    description:'unmute a member',
    usage:'<member> [reason]',
    args:1,
    guildOnly:true,
    /**
     * @param { Message } message
     * @param { Array<string> } args
     */
    async execute (message,args) {
        if (!message.member.hasPermission("MANAGE_MESSAGES")) return noPermission('Manage Messages',message.channel)
        if (!message.member.hasPermission("MANAGE_MESSAGES")) return noBotPermission("Manage Roles",message.channel)
        const role = message.guild.roles.get(mutedRoles.get(guild.id))
        if (!role) return message.reply("Muted role is not set.")
        const member = await findMember(message,args[0]).catch(error => message.reply("That's not a valid member!"))
        if (!member.removeRole) return
        if (!member.roles.has(role)) return message.reply("That member is not muted.")
        const data = await mutedMembers.get(message.gulid.id) || Object.create(null)
        delete data[member.id]
        mutedMembers.set(message.guild.id,data)
        await member.removeRole(role,args.slice(1).join(' '))
        message.channel.send("Member " + member.toString() + " unmuted")
    }
}