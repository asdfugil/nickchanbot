const { mute_info } = require('../../sequelize')
const { findRole } = require('../../modules')
const { Message, MessageEmbed } = require('discord.js')
module.exports = {
  name: 'set-muted-role',
  args: 1,
  guildOnly: true,
  description: { en: 'set the muted role and automatically deny all read message permissions.' },
  usage:{ en:'<role>' },
  userPermissions: ['MANAGE_ROLES', 'MANAGE_MESSAGES'],
  clientPermissions: ['MANAGE_ROLES'],
  /**
   * 
   * @param { Message } message 
   * @param { string[] } args 
   */
  execute(message, args) {
    const role = findRole(message, args.join(' '))
    if (!role) return message.channel.send('role not found.')
    if (role.position >= message.member.roles.highest.position) return message.reply("you can't set the muted role to be a role higher than you.")
    if (role.position >= message.guild.me.roles.highest.position) return message.reply("that role is higher than me and cannot be used as the muted role.")
    message.channel.send(
      (new MessageEmbed())
        .setDescription(`Setting muted role to ${role.toString}...`)
        .setColor('RANDOM')
      , { allowedMentions: 'none' })
      .then(async msg => {
        const allowedChannels = msg.guild.channels.cache.filter(x => x.permissionsFor(message.guild.me).has('MANAGE_ROLES'))
        for (const [_, channel] of allowedChannels) {
          // doesn't matter, will get ratelimited anyways
          await channel.createOverwrite(role, { SEND_MESSAGES: false })
        }
        const oldMuteInfo = await (mute_info.findOne({ where: { guild_id: message.guild.id } }))?.dataValues ||
          { guild_id: message.guild.id, mutes: {} }
        oldMuteInfo.muted_role = role.id
        mute_info.upsert(oldMuteInfo)
        msg.edit(
          (new MessageEmbed())
            .setDescription(`Muted role is set to ${role.toString()}`)
            .setColor(0x00ff00))
      })
  }
}