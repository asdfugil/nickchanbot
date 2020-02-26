require("dotenv").config();
module.exports = {
  name: "changelogs",
  description: "Shows bot changelogs",
  aliases: ["whats-new", "change-logs"],
  cooldown: 5,
  execute: async (message, args) => {
    message.channel.send(
      `Changelogs for ` + message.client.user.username + " " + process.env.BOT_VERSION)
    message.channel.send(message.client.changelogs, { code: true });
  }
};
