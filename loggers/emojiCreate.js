const { postLog } = require('../custom_modules')
const { Emoji } = require('discord.js')
module.exports = {
    name:'emojiCreate',
    logged: `when a emoji is created`,
    /**@param { Emoji } emoji*/
    async execute(emoji) {
        postLog('emojiCreate', emoji.guild, embed => {
            embed.setAuthor(emoji.guild.name, emoji.guild.iconURL)
                .setColor(0x00ff00)
                .setTitle("Emoji Created")
                .setDescription(emoji.toString())
                .addField("ID", emoji.id)
                .addField("Name", emoji.name)
                .setThumbnail(emoji.url)
                .addField("Animated", emoji.animated)
                .addField("URL",emoji.url)
                .setFooter(emoji.client.user.tag, emoji.client.displayAvatarURL);
        })
    }
}