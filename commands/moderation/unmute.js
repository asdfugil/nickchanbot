const { mute_info } = require('../../sequelize')
const { findMember } = require('../../modules')
const { Message, MessageEmbed } = require('discord.js')
require('moment-duration-format')
module.exports = {
  name:'unmute',
  description:{ en:'unmute a member' },
  usage:{ en: "<member> [reason]"},
  userPermissions:['MANAGE_MESSAGES'],
  clientPermissions:['MANAGE_ROLES'],
  guildOnly:true,
  args:1,
  /**
   * 
   * @param { Message } message 
   * @param { string[] } args 
  */
  async execute(message,args) {
    if (args.slice(1).toString() > 512) return message.reply('reason cannot be longer than 512 characters.')
    const roleID = (await mute_info.findOne({ where:{ guild_id:message.guild.id }}))?.dataValues?.muted_role
    const role = message.guild.roles.cache.get(roleID)
    if (!role) return message.reply('muted role not set or deleted.')
    const member = await findMember(message,args[0])
    if (member.roles.highest.position >= message.member.roles.highest.position) return message.reply('No muting someone higher than you.')
    if (role.position >= message.guild.me.roles.highest.position) return message.reply('the muted role is higher than me and I can\' assign the role.')
    await member.roles.remove(role,args.slice(1).toString() || 'No reason given')
    const muteInfo = (await mute_info.findOne({ where:{ guild_id:message.guild.id }}))?.dataValues
    ||  { guild_id: message.guild.id, mutes: {} }
    delete muteInfo.mutes[member.id];
    mute_info.upsert(muteInfo)
  }
}