const { postLog } = require('../custom_modules')
const { Emoji } = require('discord.js')
module.exports = {
    name:'emojiDelete',
    logged: `when a emoji is created`,
    /**@param { Emoji } emoji*/
    async execute(emoji) {
        postLog('emojiDelete', emoji.guild, embed => {
            embed.setAuthor(emoji.guild.name, emoji.guild.iconURL)
                .setColor(0xff0000)
                .setTitle("Emoji Deleted")
                .setDescription(emoji.toString())
                .addField("ID", emoji.id)
                .addField("Name", emoji.name)
                .addField("Animated", emoji.animated)
                .setThumbnail(emoji.url)
                .addField("URL",emoji.url)
                .setFooter(emoji.client.user.tag, emoji.client.displayAvatarURL);
        })
    }
}