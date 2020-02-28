const ranks = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "ranks"
})
const rankSettings = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "rank-settings"
})
const { Rank } = require(".")
const { Message } = require('discord.js')
module.exports = async message => {
  if (!message.guild) return;
  if (message.author.bot) return
  const { xpCooldowns } = message.guild;
  if (xpCooldowns.has(message.member.id)) return;
  const xp = Math.random() * 3 + 7
  const data = await ranks.get(message.guild.id) || Object.create(null)
  let oldRank;
  let newRank;
  if (data[message.member.id]) oldRank = new Rank(data[message.member.id])
  data[message.member.id] = (data[message.member.id] || 0) + xp
  newRank = new Rank(data[message.member.id])
  if (newRank.getLevel() - oldRank.getLevel()) message.client.emit("lvlup", message, oldRank.getLevel(), newRank.getLevel())
  ranks.set(message.guild.id, data)
  xpCooldowns.set(message.member.id, Date.now())
  setTimeout(() => xpCooldowns.delete(message.member.id), 60000)
};
client.on("lvlup",
  /**
  * @param { Message } message - The message the make the member level
  * @param { number } o - Old level
  * @param { number } n - new level
  */
  async (message, o, n) => {
    const { member } = message
    if (!member.guild.me.hasPermission("MANAGE_ROLES")) return
    const { rewards } = await rankSettings.get(message.guild.id)
    const role_id = rewards[n.toString()]
    if (!role_id) return
    const role = message.guild.roles.get(role_id)
    if (!role) return
    if (message.guild.me.highestRole.comparePositionTo(role) <= 0) return
    message.member.addRole(role, "Level rewards")
  }
)