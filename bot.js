'use strict'
require('dotenv').config()
console.log("Starting...");;
const Discord = require('discord.js')
const fs = require('fs')
const { BOT_TOKEN,PREFIX } = process.env
const serialize = require("serialize-javascript")
const { deserialize } = require("./custom_modules/ncbutil.js")
const prefix = PREFIX
const { Collection } = Discord
Discord.Guild.prototype.xpCooldowns = new Collection()
const client = new Discord.Client()
const Keyv = require('keyv')
const prefixs = new Keyv("sqlite://.data/database.sqlite",{namespace:'prefixs'})
client.commands = new Collection()
client.loggers = new Collection()
const ranks = new Keyv("sqlite://.data/database.sqlite",{namespace:'ranks'})
const check = require('./custom_modules/check.js')
const commandFiles = fs.readdirSync('./commands').filter(file => (file.endsWith('.js') || file.endsWith('.ts')));
const loggerFiles = fs.readdirSync('./loggers').filter(file => (file.endsWith('.js') || file.endsWith('.ts')));
const processRank = require('./custom_modules/ranks.js')
const mutedutil = require("./custom_modules/muted.js")
for (const file of commandFiles) {
  try {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
	console.log(`Loaded '${command.name}' Command`)
  } catch (error) {
    console.error(`Unable to load ${file}, reason:\n${error.stack}`)
  }
}
for (const file of loggerFiles) {
  try {
    const logger = require(`./loggers/${file}`)
    client.loggers.set(logger.name,logger)
    console.log(`Loaded '${logger.name}' logger.`)
  } catch (error) {
    console.error(`Unable to load ${file}, reason:\n${error.stack}`)
  }
}
require('./custom_modules/loggers.js')(client)
const cooldowns = new Collection();
client.once('ready', () => {
	console.log('Ready!');
  mutedutil.mutedTimers(client)
  mutedutil.updateMutedRoles(client)
});
client.on('ready',() => check(client,ranks))
ranks.on('error',console.error)
client.on("guildCreate",guild => ranks[guild.id] = {})
client.on("guildDelete",guild => ranks[guild.id] = undefined)
client.on('message',async message => {
  let actualPrefix = prefix
  if (message.guild) {
    if (await prefixs.get(message.guild.id)) actualPrefix = await prefixs.get(message.guild.id)
  }
  processRank(message,ranks)
	if (!message.content.startsWith(actualPrefix) || message.author.bot) return;
	const args = message.content.slice(actualPrefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)) || 
        client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName))

	if (!command) return;
console.log(`Command received from ${message.author.tag}
command name:${commandName}
arguments:${args}`)
	if (command.guildOnly && message.channel.type !== 'text') return message.reply('I can\'t execute that command inside DMs!');
	
    if (command.nsfw && !message.channel.nsfw) return message.reply('NSFW commands can only be used in NSFW channels.')
	if (command.args > args.length) {
		let reply = `You didn't provide enough arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${actualPrefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		await command.execute(message, args)
    .catch(error => {
      console.error(error);
		if (!error.code) message.reply('there was an error trying to execute that command!');
    else  message.reply(`there was an error trying to execute that command! (${error.code})`);
    })
	} catch (error) {
		console.error(error);
		if (!error.code) message.reply('there was an error trying to execute that command!');
    else  message.reply(`there was an error trying to execute that command! (${error.code})`);
	}
});
client.login(BOT_TOKEN)