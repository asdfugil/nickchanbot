const ranks = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "ranks"
})
const { Ranks } = require(".")
module.exports = async message => {
  if (!message.guild) return;
  if (message.author.bot) return
  const { xpCooldowns } = message.guild;
  if (xpCooldowns.has(message.member.id)) return;
  const xp = Math.random() * 3 + 7
  const data = await ranks.get(message.guild.id) || Object.create(null)
  data[message.member.id] = (data[message.member.id] || 0) + xp
  ranks.set(message.guild.id, data)
  xpCooldowns.set(message.member.id, Date.now())
  setTimeout(() => xpCooldowns.delete(message.member.id), 60000)
};
const rankRewards = function(message) {
}