const { Collection, Message } = require("discord.js");
const fs = require('fs')
module.exports = {
  name: 'liveupdate',
  aliases: ['live-update'],
  description: { en: 'Reload most of the bot without restarting' },
  devsOnly: true,
  /**
   * 
   * @param { Message } message 
   * @param { string[] } args 
   */
  async execute(message, args) {
    const { client } = message
    require.cache = {}
    require('dotenv').config()
    client.removeAllListeners()
    client.commands = new Collection()
    client.modules = new Collection()
    const moduleDirs = fs
      .readdirSync("./commands", { withFileTypes: true })
      .filter(x => x.isDirectory)
      .filter(x => x.name !== 'index.js')
      .map(x => x.name)
    for (let moduleName of moduleDirs) {
      const module_ = require(`../${moduleName}`)
      module_.commands = new Collection()
      const commandFiles = fs.readdirSync(`./commands/${moduleName}`)
        .filter(file => file.endsWith(".js"))
      for (const commandName of commandFiles) {
        try {
          const command = require(`../${moduleName}/${commandName}`)
          command.module = module_
          module_.commands.set(command.name, command)
          client.commands.set(command.name, command)
          if (command.module.id !== 'nsfw' && command.nsfw && !command.supressNSFWwarning) console.error(`WARNING: Command "${command.name}" is NSFW but not in nsfw module!`)
          if (command.module.id === 'nsfw' && !command.nsfw && !command.supressNSFWwarning) console.error(`WARNING: Command "${command.name}" is not NSFW but in nsfw module!`)
          //console.debug(`Loaded command "${command.name}".`)
        } catch (error) {
          console.error(error)
        }
      }
      client.modules.set(module_.id, module_)
    }
    client.on("message", require('../../modules/message_handler'));
    client.guilds.cache.forEach(async guild => {
      const value = await language.findOne({ where: { id: guild.id } })
      guild.language = value ? value.language : 'en'
    })
    require("../../modules/loggers.js")(client);
    message.channel.send('Reloaded successfully')
  }
}