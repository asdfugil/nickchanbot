const { postLog } = require('../custom_modules')
module.exports = {
    name:'guildBanRemove',
    logged:'a user is unbanned',
    async execute (guild,user) {
        postLog('guildBanRemove',guild,embed => {
            embed.setColor("#00FF00")
            .setAuthor(guild.name,guild.iconURL)
            .setThumbnail(user.displayAvatarURL)
            .setDescription(user.toString()+ " has been unbanned")
            .setFooter(guild.client.user.tag,guild.client.user.displayAvatarURL)
        })
    }
}