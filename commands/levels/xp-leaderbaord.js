const { RichEmbed } = require("discord.js")
const ranks = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "ranks"
})
const { Rank } = require("../../modules/ncbutil.js.js") // Rank constructor
module.exports = {
  name: "xp-leaderboard",
  aliases: ["xp-lb","xplb","lbxp","lb-xp","leaderboard-xp","levels","leaderboard","lb"],
  description: "Shows xp leaderboard",
  guildOnly: true,
  execute: async (message,args) => {
    const data = await ranks.get(message.guild.id)
    const lb = Object.keys(data).map(x => data[x])
    const leaderboard = []
    lb.sort((a,b) => b - a)
    const topTen = lb.slice(0,10)
    for (const item of topTen) {
      const id = Object.keys(data).find(key => data[key] === item)
      const user = await message.client.fetchUser(id)
      const rank = new Rank(item)
      leaderboard.push(`:small_blue_diamond: ${user.username}\n**Level ${rank.getLevel()} (${rank.getLevelXP()})**`)
    }
    // lb.findIndex(x => x === item) + 1
    const embed = new RichEmbed()
    .setColor("RANDOM")
    .setTitle(":trophy: XP Leaderboard")//, "https://cdn.glitch.com/4442458b-7518-4393-9be3-14c12934f6d0%2FIMG_20200501_164149.jpg?v=1588322551669")
    .setDescription(leaderboard.join("\n"))
    .setFooter(message.guild.name);
    message.channel.send(embed)
  }
}
