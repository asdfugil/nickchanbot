const moment = require('moment');
const fetch = require('node-fetch');

module.exports = {
	name: '8ball',
	description: 'Ask your questions to the magical 8ball .',
  aliases: ['8-ball', 'eightball', 'eight-ball'],
  cooldown: 3,
	execute(message, args) {
    (async () => {
      const { response } = await fetch('https://nekos.life/api/v2/8ball').then(response => response.json());
      if (!args.length) {
        return message.channel.send('Please specify the arguments for 8ball to answer!');
      }
      message.channel.send(response);
    })();
  },
};
// Special thanks to FAV