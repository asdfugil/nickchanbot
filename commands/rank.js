const Keyv = require("keyv");
const {
  Rank,
  findMember,
  deserialize
} = require("../custom_modules/ncbutil.js");
const serialize = require("serialize-javascript");
const { RichEmbed } = require("discord.js");
const ranks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "ranks",
  serialize: serialize,
  deserialize: deserialize
});
module.exports = {
  name: "rank",
  aliases: ["levels"],
  guildOnly: true,
  description: "shows you or a member's level",
  execute: async (message, args) => {
    const member = message.member;
    const guildRanks = await ranks.get(message.guild.id);
    if (await guildRanks[member.id]) {
      const rank = new Rank(ranks.get(message.guild.id)[member.id])
      const embed = new RichEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL)
        .setColor("#0edbed")
        .addField("Level", rank.getLevel())
        .addField("XP for this level", rank.getLevelXP())
        .addField("Total XP", rank)
        .setTimestamp()
        .setFooter(
          message.client.user.tag,
          message.client.user.displayAvatrURL
        );
    } else {
      message.reply(member.user.tag + " is not ranked yet.");
    }
  }
};
