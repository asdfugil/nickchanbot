const { mute_info } = require('../../sequelize')
const { findMember } = require('../../modules')
const { Message, MessageEmbed } = require('discord.js')
const parseDuraiuon = require('parse-duration')
const moment = require('moment')
require('moment-duration-format')
module.exports = {
  name:'mute',
  description:{ en:'mute a member' },
  usage:{ en: "<member> [time] [reason]"},
  info:{ en:'use 0 for Infinity '},
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
    if (args.slice(2).toString() > 512) return message.reply('reason cannot be longer than 512 characters.')
    const roleID = (await mute_info.findOne({ where:{ guild_id:message.guild.id }}))?.dataValues?.muted_role
    const role = message.guild.roles.cache.get(roleID)
    if (!role) return message.reply('muted role not set or deleted.')
    const timeInMs = parseDuraiuon(args[1])
    let readableTime = moment.duration()
    .format('Y [years], M [months], W [weeks], D [days], H [hours], m [minutes], s [seconds], S [milliseconds]')
    if (!timeInMs) readableTime = 'infinity'
    const member = await findMember(message,args[0])
    if (member.roles.highest.position >= message.member.roles.highest.position) return message.reply('No muting someone higher than you.')
    if (role.position >= message.guild.me.roles.highest.position) return message.reply('the muted role is higher than me and I can\' assign the role.')
    await member.roles.add(role,args.slice(2).toString() || 'No reason given')
    const embed = new MessageEmbed()
    .setDescription(`Member ${member.toString()} muted.`)
    .addField('Reason',args.slice(2).toString() || 'No reason given')
    .setColor('RANDOM')
    message.channel.send(embed)
    const mutes = (await mute_info.findOne({ where:{ guild_id:message.guild.id }}))?.dataValues?.mutes || {}
    mutes[member.id] = (timeInMs == 0 || timeInMs == Infinity) ? Date.now() + timeInMs : null
    mute_info.upsert({ guild_id:message.guild.id,muted_role:roleID,mutes })
    setTimeout(async () => {
      const newInfo = (await mute_info.findOne({ where:{ guild_id:message.guild.id }}))?.dataValues
      ||  { guild_id: message.guild.id, mutes: {} }
      if (message.guild.deleted || role.deleted || !member.managable 
      || role.posiiton >= message.guild.me.roles.highest.position) return
      await member.roles.remove(role,'Automatic un-mute')
      delete newInfo.mutes[member.id]
      mute_info.upsert(newInfo)
    },timeInMs)
  }
}