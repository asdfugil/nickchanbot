require("dotenv").config();
const AniList = require("anilist-node");
const anilist = new AniList(process.env.ANILIST_TOKEN)
module.exports = {
    name: 'anime-manga-character',
    aliases: ['anime-character', 'manga-character'],
    description: 'Search for a anime or manga character on AniList',
    async execute(message, args) {
        const results = await anilist.search('character', args.join(' '), 1, 20)
        const content = results.characters.map(result =>
            `${result.name.first || "(English name unavailable)"} ${result.name.last||''} (${
            result.name.native ||`${result.name.first} ${result.name.last||''} `}) - ID:${result.id}`
        );
        const displayMsg = await message.channel.send(
            `Type the ID to see the details. (60 seconds)
  Showing page ${results.pageInfo.currentPage} of ${results.pageInfo.total}
  ${content.join("\n")}`,
            { code: true }
        );
        message.channel
            .createMessageCollector(
                x => x.author.id === message.author.id && parseInt(x),
                {
                    time: 60000,
                    maxMatches: 1
                }
            )
            .on('collect', m => m.client.commands.get('anime-manga-character-byid').getCharacters(m, m.content))
    }
}