const fetch = require("node-fetch");
module.exports = {
  name: "8ball",
  description: "Ask your questions to the magical 8ball .",
  aliases: ["8-ball", "eightball", "eight-ball"],
  cooldown: 1,
  args: 1,
  async execute(message, args) { message.channel.send((await fetch("https://nekos.life/api/v2/8ball").then(response => response.json())).response);
  }
};
// Special thanks to FAV
