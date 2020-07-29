const { tags } = require('../../sequelize')
module.exports = {
  name:"delete-tag",
  aliases:["deleletags","remove-tag"],
  description:"deletes a tag",
  async execute (message,args) {
    const guildTags = (await tags.findOne({where:{guild_id:message.guild.id}}))?.dataValues?.tags || Object.create(null)
    if (!guildTags[args.join(" ").toLowerCase()]) return message.reply("That's not a valid tag!")
    delete guildTags[args.join(" ").toLowerCase()]
    tags.upsert({
      guild_id:message.guild.id,
      tags:guildTags
    })
    return message.channel.send("Tag deleted.")
  }
}