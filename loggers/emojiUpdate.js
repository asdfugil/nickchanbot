const { postLog } = require('../custom_modules')
module.exports = {
    name:'emojiUpdate',
    logged:'a emoji is updated',
    async execute (o,emoji) {
        postLog('emojiUpdate',emoji.guild,embed => {
            embed.setColor(0xbefc03)
            .setTitle("Emoji Updated")
            .addField("Name",`${o.name} -> ${emoji.name}`)
            .setThumbnail(emoji.url)
            .setAuthor(emoji.guild.name,emoji.guild.iconURL)
            .setFooter(emoji.client.user.tag,emoji.client.user.displayAvatarURL)
        })
    }
}