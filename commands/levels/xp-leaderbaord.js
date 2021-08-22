const { MessageEmbed } = require("discord.js")
const { guild_rank } = require('../../sequelize')
const { Rank } = require("../../modules/ncbutil.js") // Rank constructor
module.exports = {
  name: "xp-leaderboard",
  aliases: ["xp-lb","xplb","lbxp","lb-xp","leaderboard-xp","levels","leaderboard","lb"],
  description: {en:"Shows xp leaderboard"},
  guildOnly: true,
  execute: async (message,args) => {
    const data = (await guild_rank.findOne({ where:{guild_id:message.guild.id}}))?.dataValues?.ranks || Object.create(null)
    const lb = Object.keys(data).map(x => data[x])
    const leaderboard = []
    lb.sort((a,b) => b - a)
    const topTen = lb.slice(0,10)
    for (const item of topTen) {
      const id = Object.keys(data).find(key => data[key] === item)
      const user = await message.client.users.fetch(id)
      const rank = new Rank(item)
      leaderboard.push(`:small_blue_diamond: ${user.username}\n**Level ${rank.level} (${rank.levelXP}/${rank.levelTotalXP})**`)
    }
    // lb.findIndex(x => x === item) + 1
    const embed = new MessageEmbed()
    .setColor("RANDOM")
    .setTitle(":trophy: XP Leaderboard")//, "https://cdn.glitch.com/4442458b-7518-4393-9be3-14c12934f6d0%2FIMG_20200501_164149.jpg?v=1588322551669")
    .setDescription(leaderboard.join("\n"))
    .setFooter(message.guild.name);
    message.channel.send({ embeds: [embed] })
  }
}
