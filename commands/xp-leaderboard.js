const { RichEmbed } = require("discord.js")
const ranks = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "ranks"
})
const { Rank } = require("../custom_modules/ncbutil.js") // Rank constructor
module.exports = {
  name:"xp-leaderboard",
  aliases:["xp-lb","xplb","lbxp","lb-xp","leaderboard-xp"],
  description:"Shows xp leaderboard",
  guildOnly:true,
  execute:async (message,args) => {
    message.channel.startTyping()
    const data = await ranks.get(message.guild.id)
    const lb = Object.keys(data).map(x => data[x])
    const leaderboard = []
    lb.sort((a,b) => b - a)
    const topTen = lb.slice(0,10)
    for (const item of topTen) {
      const id = Object.keys(data).find(key => data[key] === item)
      const user = await message.client.fetchUser(id)
      const rank = new Rank(item)
      leaderboard.push(`${lb.findIndex(x => x === item) + 1}. ${user.tag} - Level ${rank.getLevel()} (${rank.getLevelXP()})`)
    }
    const embed = new RichEmbed()
    .setDescription(leaderboard.join("\n"))
    message.channel.send(embed)
    message.channel.stopTyping()
  }
}