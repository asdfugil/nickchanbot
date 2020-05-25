module.exprots = {
    name:'kick',
    description:{ en:'kick a member' },
    guildOnly:true,
    args:1,
    usage:{ en:'<member> [days delete] [reason]' },
    clientPermissions:['KICK_MEMBERS'],
    userPermissions:['KICK_MEMBERS'],
    translations:{
        
    },
    /**
     * @param { import('discord.js').Message } message 
     * @param { string[] } args 
     */
    async execute(message,args) {
        const member = require('../../custom_modules').findMember(message,args[0]);
        let reason;
        const days_delete = parseInt(args[1])
        reason = isNaN(days_delete) ? args.slice(1).join() : args.slice(2).join(' ')
        if (!isNaN(days_delete) && (days_delete <= 0 || days_delete > 7)) return message.reply('[days delete] must be between 0 to 7')
        if (reason.length > (512 - message.author.tag.length - 3)) return message.reply(`Reason cannot be longer than ${(512 - message.author.tag.length - 3)}!`)
        member.ban({ reason:message.author.tag + ' - ' + (reason || "No reason given"),days:days_delete || 0})
    }
}