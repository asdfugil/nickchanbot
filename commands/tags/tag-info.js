const { tags } = require('../../sequelize')
const { MessageEmbed } = require("discord.js")
module.exports = {
  name:"tag-info",
  description:'shows tag info',
  guildOnly:true,
  args:1,
  async execute (message,args) {
    const guildTags = (await tags.findOne({where:{guild_id:message.guild.id}}))?.dataValues?.tags || Object.create(null)
    const tag = guildTags[args.join(' ').toLowerCase()]
    if (!tag) return message.reply("That's not a valid tag!")
    const cleaned = message.client.commands.get("eval").clean(tag)
    const embed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription('```'+cleaned+'```')
    .setTitle("Tag info")
    .addField("Name",args.join(' ').toLowerCase())
    message.channel.send({ embeds: [embed] })
  }
}