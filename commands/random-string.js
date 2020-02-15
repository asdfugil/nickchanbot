const { Attachment } = require("discord.js");
const fs = require("fs");
module.exports = {
  name: "randomstring",
  aliases: ["random-string", "randomtext", "random-text"],
  usage: "<integer>",
  info: "the integer must be between 1 and 1048576",
  args:true,
  cooldown: 30,
  random: length => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  execute:async (receivedMessage, args) => {
    if (args[0] <= 1048576) {
      const str = module.exports.random(args[0]);
      if (args[0] <= 2000 && args[0] > 0) {
        receivedMessage.channel.send(str);
      }
      fs.writeFileSync("./temp/str.txt", str);
      receivedMessage.channel.send(new Attachment("./temp/str.txt"));
    } else {
      receivedMessage.channel.send(
        "Value out of range. Must between 1 and 1048576"
      );
    }
  }
};
