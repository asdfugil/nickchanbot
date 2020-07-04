const fetch = require('node-fetch')
const valid_args = [
'femdom', 'tickle', 'classic', 'ngif', 'erofeet', 'meow', 'erok', 'poke', 'hololewd','lewdk', 'keta', 'feetg', 'nsfw_neko_gif', 'eroyuri', 'kiss', '8ball', 'kuni', 'tits', 'pussy_jpg', 'cum_jpg', 'pussy', 'lewdkemo', 'lizard', 'slap', 'lewd', 'cum', 'cuddle', 'spank', 'smallboobs', 'goose', 'Random_hentai_gif', 'avatar', 'fox_girl', 'nsfw_avatar', 'hug', 'gecg', 'boobs', 'pat', 'feet', 'smug', 'kemonomimi', 'solog', 'holo', 'wallpaper', 'bj', 'woof', 'yuri', 'trap', 'anal', 'baka', 'blowjob', 'holoero', 'feed', 'neko', 'gasm', 'hentai', 'futanari', 'ero', 'solo', 'waifu', 'pwankg', 'eron', 'erokemo'
];
module.exports = {
  name: "nekos",
  aliases: ["nekosimg"],
  nsfw: true,
  usage: { en: "<argument>" },
  description:
    { en: "Send a link to a relvant image. Powered by nekos.life ." },
  clientPermissions: ['EMBED_LINKS'], info: {
    en:
      "Valid arguments:\n\n`" +
      valid_args.join("` `") +
      "`" + "\nIf no argument is providied, send a link to a random image."
  }, async execute(message, args) {
    message.channel.startTyping();
    const api = "https://nekos.life/api/v2/img/";
    if (!valid_args.includes(args.join(' ')) && args[0]) return message.reply("That's not a valid argument!")
    const { url } = await fetch(api + (args[0] ? args.join(' ') : valid_args[Math.floor(Math.random() * valid_args.length)])).then(res => res.json())
    await message.channel.send(url)
    message.channel.stopTyping()
  }
};
