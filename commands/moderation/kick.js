const t = require('..')
const { findMember, role_check } = require('../../custom_modules')
const { MessageEmbed } = require('discord.js')
module.exprots = {
    name: 'kick',
    description: { en: 'kick a member' },
    guildOnly: true,
    args: 1,
    usage: { en: '<member> [reason]' },
    clientPermissions: ['KICK_MEMBERS'],
    userPermissions: ['KICK_MEMBERS'],
    translations: {
        bot_position_nokick: {
            en: 'I can\'t kick someone that have a higher role than you.',
            zh:'我不能踢出身份組比我高的成員'
        },
        user_position_nokick: {
            en: 'You can\'t kick someone that have a higher role than you.',
            zh:'你不能踢出身份組比你高的成員'
        }, 
        reason_too_long: {
           zh:"原因的長度不能大於" ,
	   en: "Reason cannot be longer than ",
      },
        days_delete_0_to_7: {
            en: '[days delete] must be between 0 to 7,',
            zh: "[刪除日數]必需在0 到7 之間"
        },
        cannot_kick: {
            en: "I can't kick that member."
        },
        kick_successful: {

        },
        kicked_reason:{
            en:" is kicked.\n**Reason:**"
        }
    },
    /**
     * @param { import('discord.js').Message } message 
     * @param { string[] } args 
     */
    async execute(message, args) {
        const c = message.client
        const g = message.guild
        const member = findMember(message, args[0]);
        let reason;
        if (role_check(member, message.member)) return message.reply(t('commands.kick.user_position_nokick', c, g))
        if (role_check(member, message.guild.me)) return message.reply(t('commands.kick.bot_position_nokick', c, g))
        const days_delete = parseInt(args[1])
        reason = args.slice(1).join()
        if (!member.kickable) return message.reply(t('commands.kick.cannot_ban', c, g))
        member.kick(message.author.tag + ' - ' + (reason || "No reason given"))
            .then(() => {
                const embed = new MessageEmbed()
                .setDescription('✅ ' + member.user.tag + t('commands.kick.kicked_reason',c,g) + reason)
                .setColor('#ff0000')
                message.channel.send(embed)
            })
    }
}
