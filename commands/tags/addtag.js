const { tags } = require('../../sequelize')
module.exports = {
  name:"addtag",
  aliases:["edit-tag","add-tag","edittag"],
  description:{ en:"add/overwrite a tag (custom commands)" },
  args:2,
  guildOnly:true,
  /**
   * 
   * @param {*} message 
   * @param { string[] } args 
   */
  async execute(message,args) {
    const tagName = args[0].toLowerCase()
    const { commands } = message.client
    const guildTags = await tags.findOne({ where:{guild_id:message.guild.id}})?.dataValues || Object.create(null)
    if (tagName === "") return message.reply("empty tag names have serious problems so they are not allowed.")
    if (commands.get(tagName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(tagName))) return message.reply("That name cannot be used as a tag name as there is a command with that name.")
    guildTags[tagName] = args.slice(1).join(" ")
    tags.upsert({
      guild_id:message.guild.id,
      tags:guildTags
    })
    message.channel.send(`Tag ${args[0]} set.`)
  }
}
