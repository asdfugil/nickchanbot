require("dotenv").config();
const AniList = require("anilist-node");
const anilist = new AniList(process.env.ANILIST_TOKEN);
const { MessageEmbed } = require('discord.js');
const { MessageAttachment } = require("discord.js");
module.exports = {
    name: 'anime-manga-character-byid',
    aliases: ['anime-character-byid', 'manga-character-byid'],
    description: { en: 'GET anime or manga characters by its AniList ID' },
    execute: async (message, args) => await module.exports.getCharacters(message, args.join(' ')),
    async getCharacters(message, id) {
        const character = await anilist.people.character(parseInt(id) || -1)
        if (!character.siteUrl) return message.reply("That's not a valid character ID!")
        const embed = new MessageEmbed()
            .setTitle(`${character.name.first || "N/A"} ${character.name.last || ''} (${character.name.native})`)
            .setURL(character.siteUrl)
            .setDescription(character.description.replace(/(<([^>]+)>)/ig, ''))
            .setImage(character.image.large)
            .addField("ID", character.id)
            .addField("Is in", character.media.map(x => {
                const { romaji, english, native } = x.title
                return `**${romaji || english || native}** (${english || "N/A"}) - Format: ${x.format} (ID:${x.id})`
            }).join('\n' || 'N/A'))
            .setFooter(`${character.favourites} ❤️`)
            .setColor("RANDOM")
        message.channel.send({
            embeds: [embed],
            files: [new MessageAttachment(
                Buffer.from(JSON.stringify(character, null, 2)),
                character.id.toString() + '.json',
                {
                    content_type: 'application/json'
                })]
        })
    }
}