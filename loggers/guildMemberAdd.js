const { postLog } = require('../custom_modules')
module.exports = {
    name:'guildMemberAdd',
    logged:'a member joined',
    async execute (member) {
        postLog('guildMemberAdd',member.guild,embed => {
            embed.setColor("#00FF00")
            .setAuthor(member.guild.name,member.guild.iconURL)
            .setThumbnail(member.user.displayAvatarURL)
            .setDescription(member.toString()+ " has joined.")
            .setFooter(member.client.user.tag,member.client.user.displayAvatarURL)
        })
    }
}