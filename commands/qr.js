const { Attachment } = require("discord.js");
const request = require('request')
const fs = require("fs");
module.exports = {
  name: "qr",
  aliases: ["qr-code", "qrcode"],
  usage: "<text>",
  info: "Encodes data in a QR Code",
  args:true,
  cooldown: 30,
  execute: async (receivedMessage, args) => {
    if(!fs.existsSync(`./temp`)) {
        fs.mkdirSync(`./temp`)
    }

    if(!fs.existsSync(`./temp/${receivedMessage.guild.id}`)) {
        fs.mkdirSync(`./temp/${receivedMessage.guild.id}`)
    }
    
    var e = -1

    var data = receivedMessage.content.split(' ').slice(1).join(' ')

    var encoderAPI = "https://chart.apis.google.com/chart?cht=qr&chs=547x547&choe=UTF-8&chld=H%7C0&chl="
    var tooLong = receivedMessage.reply("Character Length Error\nCharacter Length >896 is not supported. Please try to shorten your string.")

    var download = function(uri, filename, callback){
        request.head(uri, function(err, res, body){
          console.log('content-type:', res.headers['content-type']);
          console.log('content-length:', res.headers['content-length']);
      
          request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
      };

    var Attachment = (receivedMessage.attachments).array();

    Attachment.forEach(function(attachment) {
        e = 1 
            var filename = attachment.url.substring(attachment.url.lastIndexOf('/')+1);
            const t = Date.now()
            const lf = `./temp/${receivedMessage.guild.id}/${receivedMessage.author.id}-file${t}.png`
            var fileDL = `${encoderAPI}${attachment.url}`
            console.log(fileDL)
            download(fileDL, lf, function() {
                
                return receivedMessage.channel.send( filename, { file: lf})
            })
              
            return;
    });

    
    if(e < 1 && data.length > 1)  {
        encoderAPI = `${encoderAPI}${data}`
        try {
            if(data.length > 896) return receivedMessage.channel.send(tooLong)
            
            download(encoderAPI, `./temp/${receivedMessage.guild.id}/${receivedMessage.author.id}.png`, function(){
              receivedMessage.channel.send({ file: `./temp/${receivedMessage.guild.id}/${receivedMessage.author.id}.png`})
            }); 
            e = 2
            return;
      } catch (ex) {
          receivedMessage.channel.send(ex)
      }
      return;
    }
  }
};
