const Meme = require('brains-api')
const { Attachment } = require('discord.js')
module.exports = {
    name:"brain",
    aliases:["brains","brain-meme"],
    description:"big brain moment",
    usage:"<text 1>,<text 2>,[text 3],...[text n]",
    args:1,
    async execute(message,args) {
        const meme = new Meme(...args.join(' ').split(','))
        meme.build().then(buffer => {
            message.channel.send(new Attachment(buffer))
        })
    }
}