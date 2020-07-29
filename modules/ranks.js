"use strict"
const { Message } = require('discord.js')
const { guild_rank } = require('../sequelize')
/**
 * 
 * @param { Message } message 
 */
module.exports = async function (message) {
  if (!message.guild || message.author.bot) return
  if (message.guild.xpCooldowns.includes(message.author.id)) return
  const ranks = (await guild_rank.findOne({ where: { guild_id: message.guild.id } }))?.dataValues?.ranks || {}
  let currentXP = ranks[message.author.id] || 0
  currentXP += Math.floor(Math.random() * 10 + 8.5)
  ranks[message.author.id] = currentXP
  await guild_rank.upsert({ guild_id: message.guild.id, ranks: ranks })
  message.guild.xpCooldowns.push(message.author.id)
  setTimeout(() => {
    const index = message.guild.xpCooldowns.indexOf(message.author.id);
    if (index > -1) {
      message.guild.xpCooldowns.splice(index, 1);
    }
  }, 60000)
}
