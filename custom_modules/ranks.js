const { Message } = require('discord.js')
const { guild_rank } = require('../sequelize')
/**
 * 
 * @param { Message } message 
 */
module.exports = async function(message) {
  if (!message.guild || message.author.bot) return
  if (message.guild.xpCooldowns.includes(message.guild.id)) return
  const ranks = await guild_rank.findOne({ where:{ guild_id:message.guild.id } }) || {}
  const currentXP = ranks.dataValues[message.author.id] || 0
  ranks.dataValues[message.author.id] = currentXP += Math.floor(Math.random() * 10 + 8.5)
  console.log(ranks)
  guild_rank.create({ guild_id:message.guild.id, ranks:ranks.dataValues })
  message.guild.xpCooldowns.push(message.author.id)
  setTimeout(() => message.guild.xpCooldowns = message.guild.xpCooldowns.filter(x => x !== message.author.id),60000)
}