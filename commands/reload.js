require('dotenv').config()
const devsID = process.env.DEVS_ID.split(",")
module.exports = {
	name: 'reload',
	description: 'Reloads a command (bot developers only)',
  cooldown:0.1,
	args: true,
  usage:' <command>',
	execute:async (message, args) => {
  if (!devsID.includes(message.author.id)) return;
		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);
        let type = 'js'
			delete require.cache[require.resolve(`./${commandName}.js`)];

		try {
			const newCommand = require(`./${commandName}.${type}`);
			message.client.commands.set(newCommand.name, newCommand);
		} catch (error) {
			console.log(error);
			return message.channel.send(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
		}
		message.channel.send(`Command \`${commandName}\` was reloaded!`);
	},
};