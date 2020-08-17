const parseTag = require("../../modules/parse-tag-vars.js");
module.exports = {
  name: "parse-tag-source",
  guildOnly: true,
  args: true,
  execute: async (message, args) => {
    try {
      message.channel.send(
        parseTag(
          message,
          {
            name: "dQw4w9WgXcQ",
            description: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            content:args.join(" "),
            nsfw: false
          },
          args
        )
      );
    } catch (error) {
      message.reply("Tag Error:\n```" + error + "```")
    }
  }
};