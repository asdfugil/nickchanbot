require('dotenv').config()
const t = require('..')
const { MessageEmbed } = require('discord.js')
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
            en:"name",
            zh:"名稱"
        }, description: {
            en:"description",
            zh:"描述"
        }, nsfw: {
            en:"NSFW",
            zh:"NSFW"
        }, info: {
            en:"Information",
            zh:"資訊"
        }, cooldown: {
            en:"cooldown",
            zh:"冷卻時間"
        },bot_permission_required:{
            en:"Bot permission requirement",
            zh:"機械人需要權限"
        },user_permission_required:{
            en:"Command invoker permission requirement",
            zh:"使用者需要權限"
        },usage:{
            en:"usage",
            zh:"用法"
        },second:{
            en:"second(s)",
            zh:"秒"
        }
    },
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
                embed
                    .addField(t('modules.' + module_.id + '.name', c,g), module_.commands.map(x => `\`${x.name}\``).join(",") || "None")
                    .setColor(0xac1677)
            }
            message.channel.send(t('commands.help.command_count', c,g) + ":" + client.commands.size, {
                embed: embed
            })
        } else {
            const data = []
            const commandName = args.join(' ').toLowerCase()
            const command = client.commands.get(commandName)
             || client.commands.find(cmd => cmd.aliases.includes(commandName))
            const module_ = client.modules.get(commandName)
             || client.modules.find(mod => t(`modules.${mod.id}.name`,c,g).toLowerCase() === commandName)
            if (command) {
                data.push(`**${t('commands.help.name',c,g)}:** ${command.name}`)
                if (command.description) data.push(`**${t('commands.help.description',c,g)}:** ${t(`help.${commandName}.description`,c,g)}`)
                if (command.cooldown) data.push(`**${t('commands.help.cooldown',c,g)}:** ${command.cooldown} ${t(`commands.help.second`,c,g)}`)
                if (command.nsfw) data.push(`**${t('commands.help.nsfw',c,g)}:** ${t(`util.boolean.true`,c,g)}`)
                if (command.info) data.push(`**${t('commands.help.info',c,g)}:** ${t(`help.${commandName}.info`,c,g)}`)
                if (command.usage) data.push(`**${t('commands.help.usage',c,g)}:** \`${actualPrefix}${commandName} ${t(`help.${commandName}.usage`,c,g)}\``)
                if (command.clientPermissions) data.push(`**${t('commands.help.bot_permissions_required',c,g)}:**${command.clientPermissions.map(perm => "`" + t(`permissions.${perm}`,c,g) + "`").join(',')}`)
                if (command.userPermissions) data.push(`**${t('commands.help.user_permissions_required',c,g)}:**${command.userPermissions.map(perm => "`" + t(`permissions.${perm}`,c,g) + "`").join(',')}`)
                message.channel.send(data.join('\n'))
            } else if (module_) {
                
            } else {

            }
        }
    }
}