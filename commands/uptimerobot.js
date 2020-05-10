require("dotenv").config()
module.exports = {
  name:"uptime-robot-page",
  aliases:["statuspage","status-page","uptime-page","uptimepage"],
  description:"Shows a link to the bot's uptime robot status page",
  cooldown:10,
  execute:async message => message.channel.send(process.env.UPTIME_ROBOT_LINK)
}