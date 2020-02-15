const rankBackground = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"rank-background"})
module.exports = {
  name:"background",
  description:"set the background image in the rank command",
  usage:"<image attachment>",
  info:"a 28:5 image is recommended",
  async execute(message,args) {
    const file = message.attachments.first()
    if (!file) return message.channel.send("You need to provide an attachment!")
    if (!file.height) return message.channel.send("That file is not an image.")
    rankBackground.set(message.author.id,message.attachments.first().proxyURL)
    message.channel.send("Rank background set.")
  }
}