require('dotenv').config()
const languages = new (require('keyv'))()
const fetch = require('node-fetch')
const t = require('..')
module.exports = {
    name:'set-language',
    guildOnly:true,
    translations:{
        lang_set:{
            en:"Language set",
            zh:"成功更改語言"
        }
    },
    async execute(message,args) {
        if (!message.member.hasPermission('MANAGE_GUILD')) return
        const res = await fetch(`http://localhost:${process.env.API_SERVER_PORT}/guilds/${message.guild.id}/language`,{
            method:"PUT",
            headers:{
               "user-agent":process.env.USER_AGENT,
                "Content-Type":'application/json',
                authorization:process.env.API_KEY
            },body:JSON.stringify({lang:args.join(' ')})
        })
            message.guild.language = args.join(' ')
            if (res.ok) {
                message.guild.lang = args.join(' ')
                message.channel.send(t('commands.set-language.lang_set',message.client,message.guild))
            }
            else throw new Error()
    }
}