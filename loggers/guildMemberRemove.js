const { postLog } = require('../custom_modules')
module.exports = {
    name:'guildMemberRemove',
    logged:'a member joined',
    async execute (member) {
        postLog('guildMemberRemove',member.guild,embed => {
            embed.setColor("#00ff00")
            .setAuthor(member.guild.name,member.guild.iconURL)
            .setThumbnail(member.user.displayAvatarURL)
            .setDescription(member.toString()+ " has left.")
            .setFooter(member.client.user.tag,member.client.user.displayAvatarURL)
        })
    }
}