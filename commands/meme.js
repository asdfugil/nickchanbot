const moment = require('moment');
const fetch = require('node-fetch');
const { RichEmbed, Attachment } = require('discord.js');
const subreddits = ["dankmemes", "memes", "MemeEconomy", "PrequelMemes", "PewdiepieSubmissions", "funny", "wholesomememes", "2meirl4meirl", "me_irl"];

module.exports = {
	name: 'meme',
	description: 'Get a random meme from Reddit.',
  aliases: ['dankmeme', 'dank-meme', 'randommeme', 'random-meme', 'randmeme', 'memes'],
  cooldown: 1,
	async execute(message) {
    const asubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
    (async () => {
      const ameme = await fetch(`https://imgur.com/r/${asubreddit}/hot.json`).then(response => response.json());
      if (!ameme.data) return;
      const imgurData = ameme.data[Math.floor(Math.random() * ameme.data.length)];
      if (!imgurData) return null;
      const image = `https://i.imgur.com/${imgurData.hash}${imgurData.ext.replace(/\?.*/, "")}`;
      if (image && image.includes(".mp4")) image = ameme;
      if (!image || image.includes(".mp4")) return message.channel.send(`Woah too fast, Try again.`);
      const memeEmbed = new RichEmbed()
      .setColor('RANDOM')
      //.setTitle(imgurData.title)
      //.setURL(`https://www.reddit.com${imgurData.reddit}`)
      .setImage(image)
      .setFooter(message.author.tag, `from /r/${asubreddit} - Requested by ${message.author.tag}`)
      .setTimestamp()
      message.channel.send(memeEmbed);
    })();
  },
};