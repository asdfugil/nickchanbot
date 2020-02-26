const { Attachment } = require("discord.js");
const request = require("request");
const fs = require("fs");
module.exports = {
  name: "qr",
  aliases: ["qr-code", "qrcode"],
  usage: "<text>",
  description: "Encodes data in a QR Code",
  args: true,
  cooldown: 30,
  execute: async (message, args) => {
    if (!fs.existsSync(`./temp`)) {
      fs.mkdirSync(`./temp`);
    }

    if (!fs.existsSync(`./temp/${message.guild.id}`)) {
      fs.mkdirSync(`./temp/${message.guild.id}`);
    }

    let e = -1;

    let data = message.content
      .split(" ")
      .slice(1)
      .join(" ");

    let encoderAPI =
      "https://chart.apis.google.com/chart?cht=qr&chs=547x547&choe=UTF-8&chld=H%7C0&chl=";
    let tooLong = async function () {message.reply(
      "Character Length Error\nCharacter Length >896 is not supported. Please try to shorten your string."
    );}

    let download = function(uri, filename, callback) {
      request.head(uri, function(err, res, body) {
        console.log("content-type:", res.headers["content-type"]);
        console.log("content-length:", res.headers["content-length"]);

        request(uri)
          .pipe(fs.createWriteStream(filename))
          .on("close", callback);
      });
    };

    let Attachment = message.attachments.array();

    Attachment.forEach(function(attachment) {
      e = 1;
      let filename = attachment.url.substring(
        attachment.url.lastIndexOf("/") + 1
      );
      const t = Date.now();
      const lf = `/tmp/${message.guild.id}/${message.author.id}-file${t}.png`;
      let fileDL = `${encoderAPI}${attachment.url}`;
      console.log(fileDL);
      download(fileDL, lf, function() {
        return message.channel.send(filename, { file: lf });
      });

      return;
    });

    if (e < 1 && data.length > 1) {
      encoderAPI = `${encoderAPI}${data}`;
      try {
        if (message.content.length > 896) return tooLong()

        download(
          encoderAPI,
          `./temp/${message.guild.id}/${message.author.id}.png`,
          function() {
            message.channel.send({
              file: `./temp/${message.guild.id}/${message.author.id}.png`
            });
          }
        );
        e = 2;
        return;
      } catch (ex) {
        message.channel.send(ex);
      }
      return;
    }
  }
};