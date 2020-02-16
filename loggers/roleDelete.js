const { postLog } = require('../custom_modules')
module.exports = {
    name:'roleDelete',
    logged:'when a role is deleted',
    async execute (role) {
        postLog('roleDelete',role.guild,embed => {
            embed
            .setColor("#ff0000")
            .setAuthor(role.guild.name, role.guild.iconURL)
            .setTitle(`Role "${role.name}" deleted`)
            .addField("Role ID", role.id)
            .addField("Auto-managed", role.managed)
            .setTimestamp()
            .setFooter(role.client.user.tag, role.client.user.displayAvatarURL);
        })
 }}