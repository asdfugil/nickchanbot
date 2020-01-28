require('dotenv').config()
const { bitly_token } = process.env.BITLY_TOKEN
const bitly = require("bitlyurl");
const isurl = require("is-url");
const util = require("util");
module.exports = {
  name: "bitly",
  args: true,
  cooldown: 1.5,
  aliases: ["shorten-url"],
  description: "Shroten a url using bitly",
  execute: async (message, args) => {
    const longurl = args.join(" ");
    if (!isurl(longurl)) return message.reply("Invalid URL");
    const url = bitly.bitlyShortenUrl(args.join(" "),bitly_token).then(url => {
      message.channel.send(util.inspect(url,{showHidden:true}));
    })
    .catch(console.error)
  }
};
