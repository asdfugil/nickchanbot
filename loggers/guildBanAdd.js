const { postLog } = require('../custom_modules')
module.exports = {
    name:'guildBanAdd',
    logged:'a user is banned',
    async execute (guild,user) {
        postLog('guildBanAdd',guild,embed => {
            embed.setColor("#FF0000")
            .setAuthor(guild.name,guild.iconURL)
            .setThumbnail(user.displayAvatarURL)
            .setDescription(user.toString()+ " has been banned")
            .setFooter(guild.client.user.tag,guild.client.user.displayAvatarURL)
        })
    }
}