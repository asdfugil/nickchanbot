require('dotenv').config()
const t = require('..')
const { MessageEmbed, Permissions } = require('discord.js')
const Keyv = require('keyv')
const prefixs = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "prefixs"
});
const prefix = process.env.PREFIX
module.exports = {
  name: "help",
  description: {
    en: "List commands or get help about a command or module",
    zh: "列出指令或取得關於某一指令或模組的幫助"
  },
  usage: {
    en: "[command or module]",
    zh: "[指令或模組]"
  }, translations: {
    command_count: {
      en: "command count",
      zh: "指令數量"
    }, name: {
      en: "name",
      zh: "名稱"
    }, description: {
      en: "description",
      zh: "描述"
    }, nsfw: {
      en: "NSFW",
      zh: "NSFW"
    }, info: {
      en: "Information",
      zh: "資訊"
    }, cooldown: {
      en: "cooldown",
      zh: "冷卻時間"
    }, bot_permission_required: {
      en: "Bot permission requirement",
      zh: "機械人需要權限"
    }, user_permission_required: {
      en: "Command invoker permission requirement",
      zh: "使用者需要權限"
    }, usage: {
      en: "usage",
      zh: "用法"
    }, second: {
      en: "second(s)",
      zh: "秒"
    }, command_list: { en:"Command list" },
    devsOnly:{ en:'bot developers only' }
  },
  clientPermissions: 16384,
  async execute(message, args) {
    let actualPrefix = prefix;
    if (message.guild) {
      if (await prefixs.get(message.guild.id))
        actualPrefix = await prefixs.get(message.guild.id);
    }
    const { client } = message
    const c = client
    const g = message.guild
    if (!args[0]) {
      const embed = new MessageEmbed()
      for (const module_ of client.modules.array()) {
        if (process.env.WEEB_ANIME_HATERS_GUILD.split(',').includes(message.guild.id)) {
          if (module_.weeb) continue
        }
        embed
          .addField(t('modules.' + module_.id + '.name', c, g), module_.commands.map(x => `\`${x.name}\``).join(",") || "None")
          .setColor(0xac1677)
      }
      message.channel.send(t('commands.help.command_count', c, g) + ":" + client.commands.size + '\n**Support Server:** ' + process.env.SUPPORT_SERVER_LINK, {
        embed: embed
      })
    } else {
      const data = []
      const commandName = args.join(' ').toLowerCase()
      const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
      const module_ = client.modules.get(commandName)
        || client.modules.find(mod => t(`modules.${mod.id}.name`, c, g).toLowerCase() === commandName)
      if (command) {
        data.push(`**${t('commands.help.name', c, g)}:** ${command.name}`)
        if (command.description) data.push(`**${t('commands.help.description', c, g)}:** ${t(`help.${command.name}.description`, c, g)}`)
        if (command.cooldown) data.push(`**${t('commands.help.cooldown', c, g)}:** ${command.cooldown} ${t(`commands.help.second`, c, g)}`)
        if (command.nsfw) data.push(`**${t('commands.help.nsfw', c, g)}:** ${t(`util.boolean.true`, c, g)}`)
        if (command.info) data.push(`**${t('commands.help.info', c, g)}:** ${t(`help.${command.name}.info`, c, g)}`)
        if (command.usage) data.push(`**${t('commands.help.usage', c, g)}:** \`${actualPrefix}${command.name} ${t(`help.${command.name}.usage`, c, g)}\``)
        if (command.clientPermissions) 
        data.push(`**${t('commands.help.bot_permission_required', c, g)}:**${Object.entries(
          (new Permissions(command.clientPermissions)
          ).serialize())
          .filter(x => x[1])
          .map(x => x[0])
          .map(perm => "`" + t(`permissions.${perm}`, c, g) + "`")
          .join(',')}`)
        if (command.userPermissions) 
        data.push(`**${t('commands.help.user_permission_required', c, g)}:**${Object.entries(
          (new Permissions(command.userPermissions))
          .serialize())
          .filter(x => x[1])
          .map(x => x[0])
          .map(perm => "`" + t(`permissions.${perm}`, c, g) + "`")
          .join(',')}`)
        message.channel.send(data.join('\n'))
      } else if (module_) {
        const data = []
        data.push(`**${t('commands.help.name',c,g)}:** ` + t(`modules.${module_.id}.name`,c,g))
        if (module_.description) data.push(`**${t('commands.help.description',c,g)}:** ` + t(`modules.${module_.id}.description`,c,g))
        if (module_.nsfw) data.push(`**${t('commands.help.nsfw',c,g)}:** ` + t('util.boolean.'+Boolean(module_.nsfw).toString(),c,g))
        if (module_.devsOnly) data.push(`**${t('commands.help.devsOnly',c,g)}:** ` + t('util.boolean.'+Boolean(module_.devsOnly).toString(),c,g))
        data.push(`**${t('commands.help.command_list',c,g)}:**`)
        module_.commands.forEach(cmd => {
          data.push('`' + cmd.name + '` - ' + t(`help.${cmd.name}.description`,c,g))
        })
        message.channel.send(data.join('\n'))
      } else {
        message.reply('Unknown command or module.')
      }
    }
  }
}