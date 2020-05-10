const globalTags = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"tags"})
const { RichEmbed } = require("discord.js")
module.exports = {
  name:"tag-info",
  description:'shows tag info',
  guildOnly:true,
  args:1,
  async execute (message,args) {
    const tag = (await globalTags.get(message.guild.id))[args.join(" ")]
    if (!tag) return message.reply("That's not a valid tag!")
    const cleaned = message.client.commands.get("eval").clean(tag.content)
    const embed = new RichEmbed()
    .setColor("RANDOM")
    .setDescription('```'+cleaned+'```')
    .setTitle("Tag info")
    .addField("Name",tag.name)
    .addField("Uses",tag.count)
    message.channel.send(embed)
  }
}