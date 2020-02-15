const globalTags = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"tags"})
module.exports = {
  name:"addtag",
  aliases:["edit-tag","add-tag","edittag"],
  description:"add/overwrite a tag (custom commands)",
  info:require("fs").readFileSync("./documents/tag-docs.txt","utf8"),
  guildOnly:true,
  args:2,
  async execute(message,args) {
    const tags = await globalTags.get(message.guild.id) || Object.create(null)
    const tagName = args[0]
    const { commands } = message.client
    if (commands.get(tagName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(tagName))) return message.reply("That name cannot be used as a tag name as there is a command with that name.")
    const tagNameList = Object.keys(tags)
    tags[args[0]] = {
      name:tagName,
      content:args.slice(1).join(" "),
      description:"",
      nsfw:false,
      count:0
    }
  await globalTags.set(message.guild.id,tags)
    message.channel.send(`Tag ${args[0]} set.`)
  }
}