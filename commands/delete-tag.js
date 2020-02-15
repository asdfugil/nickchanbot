const globalTags = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"tags"})
module.exports = {
  name:"delete-tag",
  aliases:["deleletags"],
  description:"deletes a tag",
  async execute (message,args) {
    const tags = await globalTags.get(message.guild.id)
    if (!tags[args.join(" ")]) return message.reply("That's not a valid tag!")
    delete tags[args.join(" ")]
    globalTags.set(message.guild.id,tags)
    return message.channel.send("Tag deleted.")
  }
}