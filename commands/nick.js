const names = require('people-names')
const { noPermission, noBotPermission } = require('../custom_modules/ncbutil.js')
module.exports = {
  name:'nick',
  guildOnly:true,
  aliases:['nickname'],
  usage:'[male|female]',
  description:'give yourself a new,random nickname',
  cooldown:2,
  execute:async (message,args) => {
    if (!message.member.hasPermission('CHANGE_NICKNAME')) return noPermission('change nickname',message.channel)
    if (!message.guild.me.hasPermission('MANAGE_NICKNAMES')) return noBotPermission('manage nicknames',message.channel)
    if ((message.guild.me.highestRole.position - message.member.highestRole.position) <= 0) return noBotPermission('a role higher than you',message.channel)
    if (message.member.id === message.guild.owner.id) return noBotPermission('Server owner',message.channel)
    if (!args[0]) message.member.setNickname(names.allRandomEn(),'Requested by the member.').then(m => message.reply(`You new nickname is \`${m.nickname}\``))
    else if (args[0].toLowerCase() === 'male')  return message.member.setNickname(names.maleRandomEn(),'Requested by the member.').then(m => message.reply(`You new nickname is \`${m.nickname}\``))
    else if (args[0].toLowerCase() === 'female') return message.member.setNickname(names.femaleRandomEn(),'Requested by the member.').then(m => message.reply(`You new nickname is \`${m.nickname}\``))
    else message.reply('That\'s not a valid option!')
  }
}