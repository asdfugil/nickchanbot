module.exports = {
  name:"stoptyping",
  aliases:["stop-typing"],
  description:"makes the bot stops typing",
  usage:"[-f|--force]",
  execute:async (message,args) =>{ 
    if (["-f","--force"].includes(args[0])) { 
      message.channel.send("Trying to stop typing...\nUsing `--force` I sure hope you know what you are doing")
      message.channel.stopTyping(true)
    } else {
      message.channel.send("Trying to stop typing...")
      message.channel.stopTyping()
    }
  }
}