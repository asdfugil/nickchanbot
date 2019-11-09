console.log('Starting...')
const Discord = require('discord.js')
const fs = require('fs')
const moment = require(`moment`)
require('moment-duration-format')
const googleIt = require('google-it');
const fetch = require('node-fetch')
const config = require('./config/config.json')
const client = new Discord.Client()
const { Attachment, RichEmbed } = require('discord.js')
const EventEmitter = require('events')
require('./config/http.js')
const queue = new Map();
const bot = new EventEmitter()
const ytdl = require('ytdl-core')
function noPermission(perms) {
    var noPermission = new RichEmbed()
        .setColor('#ffff00')
        .setFooter(client.user.tag, client.user.displayAvatarURL)
        .setTimestamp()
        .setDescription(`You don't have the permissions to use this command.\nOnly members with **${perms}** permission(s) can use this command`)
    return noPermission
}
var talkChannelOn = false
var talkChannel = 'off'
client.login(config.token)
process.on('uncaughtException', (error) => {
    console.log(error)
    try {
        client.user.setActivity('❌ uncaughtExpection | Rebooting...')
        fs.writeFileSync('error.txt', error.stack)
        client.channels.get('633686557580066866').send(`Uncaught expection \n \`\`\`${error.stack}\`\`\``)
        client.channels.get('633686557580066866').send(new Discord.Attachment('error.txt'))
    } catch (error) {
        console.error('Error!')
    } finally {
        console.error(error)
        setTimeout(function () {
            process.exit(1)
        }, 20000)
    }
})
process.on('exit', code => {
    console.log('Exit code:' + code)
    client.channels.get('633686557580066866').send('Exiting... logs for this session:')
    client.channels.get('633686557580066866').send(new Discord.Attachment('logs.txt'))
})
process.on('unhandledRejection', (error, promise) => {
    client.user.setActivity('⚠️ unhandledRejection')
    console.warn(`Oops,the following promise rejection is not caught.\n${error.stack}\n${JSON.stringify(promise, null, 2)}`)
    fs.writeFileSync('error.txt', error.stack)
    client.channels.get('637839532976504869').send(`Unhandlled Expection \n \`\`\`${error.stack}\`\`\``)
    client.channels.get('637839532976504869').send(new Discord.Attachment('error.txt'))
    setTimeout(function () {
        client.user.setActivity(`/help | ${client.guilds.size} server(s)`)
    }, 10000)
})
bot.on('error', console.error)
bot.on('missingLogChannel', (channelID, guild, logType) => {
    let settingsExist = fs.existsSync(`./data/${guild.id}.json`)
    if (settingsExist) {
        var serverSettings = JSON.parse(fs.readFileSync('./data/' + guild.id + '.json', 'utf8'))
        eval('serverSettings.logChannels.' + logType + '= undefined')
        fs.writeFileSync('./data/' + guild.id + '.json', JSON.stringify(serverSettings, null, 2))
        if (serverSettings.logChannels.error != 'undefined') {
            const embed = new RichEmbed()
                .setTitle('Error : Missing log channel')
                .setDescription('Likely due to the channel being deleted\nlog channel type : ' + logType + '\n log channel ID: ' + channelID + '\n\nThe log channel has been deleted from the settings.')
                .setAuthor(guild.name, guild.iconURL)
                .setColor('#ff0000')
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL)
            if (typeof client.channels.get(serverSettings.logChannels.error) == 'undefined') return bot.emit('missingLogChannel', serverSettings.logChannels.error, guild, 'error')
            client.channels.get(serverSettings.logChannels.error).send(embed)
        }
    }
})
client.on('message', (receivedMessage) => {
    let processStart = Date.now()
    try {
        if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
            return
        }
        if (receivedMessage.guild) {
            let settingsExist = fs.existsSync(`./data/${receivedMessage.guild.id}.json`)
            if (settingsExist) {
                var serverSettings = JSON.parse(fs.readFileSync('./data/' + receivedMessage.guild.id + '.json', 'utf8'))
                if (typeof serverSettings.logChannels.message != 'undefined') {
                    if (receivedMessage.content) {
                        const embed = new Discord.RichEmbed()
                            .setTitle('Message Log')
                            .setAuthor(receivedMessage.author.tag, receivedMessage.author.displaydisplayAvatarURL)
                            .setDescription(receivedMessage.content)
                            .addField('Channel', receivedMessage.channel)
                            .setColor('#28b9de')
                            .setTimestamp()
                            .setFooter('Nick Chan#5213', client.user.displaydisplayAvatarURL)
                        if (typeof client.channels.get(serverSettings.logChannels.message) == 'undefined') return bot.emit('missingLogChannel', serverSettings.logChannels.message, receivedMessage.guild, 'message')
                        client.channels.get(serverSettings.logChannels.message).send(embed)
                    }
                }
            } else {
                let rawData = JSON.parse(fs.readFileSync('defaultServerSettings.json', 'utf8'))
                let data = JSON.stringify(rawData, null, 2)
                fs.writeFile('./data/' + receivedMessage.guild.id + '.json', data, (err) => {
                    try {
                        if (err) throw err
                        console.log('Setting created for server.')
                    } catch (error) {
                        receivedMessage.channel.send(`An Error occured.. \n\n \`${error.name}:${error.message}\``)
                        console.log(error)
                    }
                })
            }
        } else {
            var serverSettings = null
        }
        if (receivedMessage.author.bot == true) {
            if (talkChannelOn && receivedMessage.channel.id == talkChannel) {
                client.channels.get('626024979900923905').send(`**${receivedMessage.author.tag}** : ${receivedMessage.content}`)
            }
            if (talkChannelOn && receivedMessage.channel.id == '626024979900923905' && !receivedMessage.content.startsWith('/set-talk-channel') && receivedMessage.author.id == '570634232465063967') {
                client.channels.get(talkChannel).send(receivedMessage.content)
            }
            return
        }
        if (receivedMessage.content.startsWith(config.prefix)) {
            if (talkChannelOn && receivedMessage.channel.id == talkChannel) {
                client.channels.get('626024979900923905').send(`**${receivedMessage.author.tag}** : ${receivedMessage.content}`)
            }
            if (talkChannelOn && receivedMessage.channel.id == '626024979900923905' && !receivedMessage.content.startsWith('/set-talk-channel') && receivedMessage.author.id == '570634232465063967') {
                client.channels.get(talkChannel).send(receivedMessage.content)
            }
            processCommand(receivedMessage, serverSettings, processStart)
        } else {
            if (talkChannelOn && receivedMessage.channel.id == talkChannel) {
                client.channels.get('626024979900923905').send(`**${receivedMessage.author.tag}** : ${receivedMessage.content}`)
            }
            if (talkChannelOn && receivedMessage.channel.id == '626024979900923905' && !receivedMessage.content.startsWith('/set-talk-channel') && receivedMessage.author.id == '570634232465063967') {
                client.channels.get(talkChannel).send(receivedMessage.content)
            }
            processTrigger(receivedMessage, serverSettings)
        }
    } catch (error) {
        sendError(error, receivedMessage)
    }
})
client.on('typingStart', (channel, user) => {
    if (!channel.guild) return
    let settingsExist = fs.existsSync(`./data/${channel.guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${channel.guild.id}.json`, 'utf8'))
        if (typeof settings.logChannels.startTyping != 'undefined') {
            const embed = new Discord.RichEmbed()
                .setTitle('Start Typing Log')
                .setAuthor(user.tag, user.displaydisplayAvatarURL)
                .setDescription(`${user.tag} started typing in ${channel}.`)
                .setColor('#ffffff')
                .setTimestamp()
                .setFooter('Nick Chan#5213', client.user.displaydisplayAvatarURL)
            if (typeof client.channels.get(settings.logChannels.startTyping) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.startTyping, channel.guild, 'startTyping')
            client.channels.get(settings.logChannels.startTyping).send(embed)
        }
    }
})
client.on('typingStop', (channel, user) => {
    if (!channel.guild) return
    let settingsExist = fs.existsSync(`./data/${channel.guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${channel.guild.id}.json`, 'utf8'))
        if (typeof settings.logChannels.stopTyping != 'undefined') {
            const embed = new Discord.RichEmbed()
                .setTitle('Stop Typing Log')
                .setAuthor(user.tag, user.displaydisplayAvatarURL)
                .setDescription(`${user.tag} stoped typing in ${channel}.`)
                .setColor('#ffffff')
                .setTimestamp()
                .setFooter('Nick Chan#5213', client.user.displaydisplayAvatarURL)
            if (typeof client.channels.get(settings.logChannels.startTyping) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.stopTyping, channel.guild, 'stopTyping')
            client.channels.get(settings.logChannels.stopTyping).send(embed)
        }
    }
})
client.on('channelCreate', async channel => {
    if (!channel.guild) return
    let settingsExist = fs.existsSync(`./data/${channel.guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${channel.guild.id}.json`, 'utf8'))
        if (typeof settings.logChannels.channelCreate != 'undefined') {
            let perms = await channel.permissionsFor(channel.guild.defaultRole)
            let object = await perms.serialize()
            if (channel.type == 'voice') {
                const embed = new Discord.RichEmbed()
                    .setTitle('Channel created')
                    .setAuthor(channel.guild.name, channel.guild.iconURL)
                    .addField('Name', channel.name)
                    .addField('Type', channel.type)
                    .addField('Channel ID', channel.id)
                    .setColor('#00e622')
                if (typeof client.channels.get(settings.logChannels.channelCreate) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.channelCreate, channel.guild, 'channelCreate')
                client.channels.get(settings.logChannels.channelCreate).send(embed)
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle('Channel created')
                    .setAuthor(channel.guild.name, channel.guild.iconURL)
                    .addField('Name', channel)
                    .addField('Type', channel.type)
                    .addField('Channel ID', channel.id)
                    .setColor('#00e622')
                client.channels.get(settings.logChannels.channelCreate).send(embed)
            }
            channel.guild.roles.forEach(role => {
                let perms = channel.permissionsFor(role)
                let object = perms.serialize()
                let overWrites = JSON.stringify(object, null, 2)
                const embed = new Discord.RichEmbed()
                    .addField(`Permissions overwrites for ${role.name}.`, `\`\`\`json\n${overWrites}\`\`\``)
                    .setColor('#00e622')
                client.channels.get(settings.logChannels.channelCreate).send(embed)
            })
            const embed = new Discord.RichEmbed()
                .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
                .setColor('#00e622')
                .setTimestamp()
            client.channels.get(settings.logChannels.channelCreate).send(embed)
        }
    }
})
client.on('channelUpdate', async (oldChannel, channel) => {
    if (JSON.stringify(oldChannel) == JSON.stringify(channel)) return
    if (!oldChannel.guild) return
    let settingsExist = fs.existsSync(`./data/${oldChannel.guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${oldChannel.guild.id}.json`, 'utf8'))
        if (typeof settings.logChannels.channelUpdate != 'undefined') {
            if (typeof client.channels.get(settings.logChannels.channelUpdate) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.channelUpdate, channel.guild, 'channelUpdate')
            let perms = await oldChannel.permissionsFor(oldChannel.guild.defaultRole)
            let object = await perms.serialize()
            if (oldChannel.type == 'voice') {
                const embed = new Discord.RichEmbed()
                    .setTitle('Channel Updated (before)')
                    .setAuthor(oldChannel.guild.name, oldChannel.guild.iconURL)
                    .addField('Name', oldChannel.name)
                    .addField('Type', oldChannel.type)
                    .addField('Channel ID', oldChannel.id)
                    .setColor('#b3ff00')
                client.channels.get(settings.logChannels.channelUpdate).send(embed)
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle('Channel Updated (Before)')
                    .setAuthor(oldChannel.guild.name, oldChannel.guild.iconURL)
                    .addField('Name', oldChannel.name)
                    .addField('Type', oldChannel.type)
                    .addField('Channel ID', oldChannel.id)
                    .setColor('#b3ff00')
                client.channels.get(settings.logChannels.channelUpdate).send(embed)
            }
            oldChannel.guild.roles.forEach(role => {
                let perms = oldChannel.permissionsFor(role)
                let object = perms.serialize()
                let overWrites = JSON.stringify(object, null, 2)
                const embed = new Discord.RichEmbed()
                    .addField(`Old Permissions overwrites for ${role.name}.`, `\`\`\`json\n${overWrites}\`\`\``)
                    .setColor('#b3ff00')
                client.channels.get(settings.logChannels.channelUpdate).send(embed)
            })
            const embed = new Discord.RichEmbed()
                .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
                .setColor('#b3ff00')
                .setTimestamp()
            client.channels.get(settings.logChannels.channelUpdate).send(embed)
            if (channel.type == 'voice') {
                const embed = new Discord.RichEmbed()
                    .setTitle('Channel Updated (After)')
                    .setAuthor(channel.guild.name, channel.guild.iconURL)
                    .addField('Name', channel.name)
                    .addField('Type', channel.type)
                    .addField('Channel ID', channel.id)
                    .setColor('#b3ff00')
                client.channels.get(settings.logChannels.channelUpdate).send(embed)
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle('Channel Updated (After)')
                    .setAuthor(channel.guild.name, channel.guild.iconURL)
                    .addField('Name', channel)
                    .addField('Type', channel.type)
                    .addField('Channel ID', channel.id)
                    .setColor('#b3ff00')
                client.channels.get(settings.logChannels.channelUpdate).send(embed)
            }
            channel.guild.roles.forEach(role => {
                let perms = channel.permissionsFor(role)
                let object = perms.serialize()
                let overWrites = JSON.stringify(object, null, 2)
                const embed = new Discord.RichEmbed()
                    .addField(`New Permissions overwrites for ${role.name}.`, `\`\`\`json\n${overWrites}\`\`\``)
                    .setColor('#b3ff00')
                client.channels.get(settings.logChannels.channelUpdate).send(embed)
            })
            const embed1 = new Discord.RichEmbed()
                .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
                .setColor('#b3ff00')
                .setTimestamp()
            client.channels.get(settings.logChannels.channelUpdate).send(embed1)
        }
    }
})
client.on('channelDelete', (oldChannel) => {
    if (!oldChannel.guild) return
    let settingsExist = fs.existsSync(`./data/${oldChannel.guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${oldChannel.guild.id}.json`, 'utf8'))
        if (typeof settings.logChannels.channelDelete != 'undefined') {
            const embed = new Discord.RichEmbed()
                .setTitle('Channel Deleted')
                .setAuthor(oldChannel.guild.name, oldChannel.guild.iconURL)
                .addField('Name', oldChannel.name)
                .addField('Type', oldChannel.type)
                .addField('Channel ID', oldChannel.id)
                .setColor('#ff0000')
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
            if (typeof client.channels.get(settings.logChannels.channelDelete) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.channelDetete, oldChannel.guild, 'channelDelete')
            client.channels.get(settings.logChannels.channelDelete).send(embed)
        }
    }
})
client.on('guildMemberAdd', (newMember) => {
    let settingsExist = fs.existsSync(`./data/${newMember.guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${newMember.guild.id}.json`))
        if (typeof settings.logChannels.guildMemberAdd == 'undefined') return
        const embed = new Discord.RichEmbed()
            .setAuthor(newMember.user.tag, newMember.user.displaydisplayAvatarURL)
            .setColor('#00fff2')
            .setTitle('Member Joined')
            .setDescription(newMember + ' has joined.')
            .setThumbnail(newMember.user.displaydisplayAvatarURL)
            .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
            .setTimestamp()
        if (typeof client.channels.get(settings.logChannels.guildMemberAdd) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.guildMemberAdd, newMember.guild, 'guildMemberAdd')
        client.channels.get(settings.logChannels.guildMemberAdd).send(embed)

    }
})
client.on('guildMemberRemove', (newMember) => {
    let settingsExist = fs.existsSync(`./data/${newMember.guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${newMember.guild.id}.json`))
        if (typeof settings.logChannels.guildMemberRemove == 'undefined') return
        const embed = new Discord.RichEmbed()
            .setAuthor(newMember.user.tag, newMember.user.displaydisplayAvatarURL)
            .setColor('#00fff2')
            .setTitle('Member left')
            .setDescription(newMember + ' has left.')
            .setThumbnail(newMember.user.displaydisplayAvatarURL)
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
        if (typeof client.channels.get(settings.logChannels.guildMemberRemove) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.guildMemberRemove, newMember.guild, 'guildMemberRemove')
        client.channels.get(settings.logChannels.guildMemberRemove).send(embed)
    }
})
client.on('guildBanRemove', (guild, user) => {
    let settingsExist = fs.existsSync(`./data/${guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${guild.id}.json`))
        if (typeof settings.logChannels.guildBanRemove == 'undefined') return
        const embed = new Discord.RichEmbed()
            .setAuthor(user.tag, user.displaydisplayAvatarURL)
            .setColor('#00fff2')
            .setTitle('User unbanned')
            .setDescription(user.tag + ' has been unbanned.')
            .setThumbnail(user.displaydisplayAvatarURL)
            .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
            .setTimestamp()
        if (typeof client.channels.get(settings.logChannels.guildBanRemove) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.guildMemberRemove, guild, 'guildBanRemove')
        client.channels.get(settings.logChannels.guildBanRemove).send(embed)
    }
})
client.on('guildBanAdd', (guild, user) => {
    let settingsExist = fs.existsSync(`./data/${guild.id}.json`)
    if (settingsExist) {
        let settings = JSON.parse(fs.readFileSync(`./data/${guild.id}.json`))
        if (typeof settings.logChannels.guildBanAdd == 'undefined') return
        const embed = new Discord.RichEmbed()
            .setAuthor(user.tag, user.displaydisplayAvatarURL)
            .setColor('#00fff2')
            .setTitle('User banned')
            .setDescription(user.tag + ' has been banned.')
            .setThumbnail(user.displaydisplayAvatarURL)
            .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
            .setTimestamp()
        if (typeof client.channels.get(settings.logChannels.guildBanAdd) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.guildBanAdd, newMember.guild, 'guildBanAdd')
        client.channels.get(settings.logChannels.guildBanAdd).send(embed)
    }
})
client.on('reconnect', () => {
    console.log('reconnecting...')
})
client.on('messageDelete', DeletedMessage => {
    if (!DeletedMessage.guild) return
    var settings = JSON.parse(fs.readFileSync('./data/' + DeletedMessage.guild.id + '.json', 'utf8'))
    if (typeof settings.logChannels.messageDelete != 'undefined') {
        if (DeletedMessage.content) {
            const embed = new Discord.RichEmbed()
                .setTitle('Message deletion Log')
                .setAuthor(DeletedMessage.author.tag, DeletedMessage.author.displaydisplayAvatarURL)
                .setDescription(DeletedMessage.content)
                .addField('Channel', DeletedMessage.channel)
                .setColor('#ff0000')
                .setTimestamp()
                .setFooter('Nick Chan#5213', client.user.displaydisplayAvatarURL)
            if (typeof client.channels.get(settings.logChannels.messageDelete) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.messageDelete, DeletedMessage.guild, 'messageDelete')
            client.channels.get(settings.logChannels.messageDelete).send(embed)

        }
    }
})
client.on('messageDeleteBulk', deletedMessages => {
    var settings = JSON.parse(fs.readFileSync('./data/' + deletedMessages.first().guild.id + '.json', 'utf8'))
    if (typeof settings.logChannels.messageDeleteBulk != 'undefined') {
        const embed = new Discord.RichEmbed()
            .setTitle('Bulk message deletion Log')
            .setAuthor(deletedMessages.first().guild.name, deletedMessages.first().guild.iconURL)
            .setDescription(deletedMessages.size + ' messages deleted')
            .addField('Channel', deletedMessages.first().channel)
            .setColor('#f705ff')
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
        if (typeof client.channels.get(settings.logChannels.messageDeleteBulk) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.messageDeleteBulk, deletedMessages.first().guild, 'messageDeleteBulk')
        client.channels.get(settings.logChannels.messageDeleteBulk).send(embed)
    }
})
client.on('messageUpdate', (oldMessage, newMessage) => {
    if (newMessage.author == client.user) return
    if (!newMessage.guild) return
    if (newMessage.content == '') return
    var settings = JSON.parse(fs.readFileSync('./data/' + newMessage.guild.id + '.json', 'utf8'))
    if (oldMessage.content.length > 1000) {
        let trimmedOld = oldMessage.content.substring(0, 1000) + '...'
        let trimmedNew = newMessage.content.substring(0, 1000) + '...'
        if (newMessage.content.length < 1000) {
            trimmedNew = newMessage.content
        }
        if (typeof client.channels.get(settings.logChannels.messageUpdate) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.messageUpdate, newMember.guild, 'messageUpdate')
        if (typeof settings.logChannels.messageUpdate != 'undefined') {
            const embed = new Discord.RichEmbed()
                .setTitle('Message Updated')
                .setAuthor(newMessage.author.tag, newMessage.author.displaydisplayAvatarURL)
                .addField('Channel', newMessage.channel)
                .addField('Old message content', trimmedOld)
                .addField('New message Content', trimmedNew)
                .setColor('#cffc03')
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
            if (typeof client.channels.get(settings.logChannels.messageUpdate) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.messageUpdate, newMember.guild, 'messageUpdate')
            client.channels.get(settings.logChannels.messageUpdate).send(embed)
        }
    } else {
        if (typeof settings.logChannels.messageUpdate != 'undefined') {
            let trimmedOld = oldMessage.content.substring(0, 1000)
            let trimmedNew = newMessage.content.substring(0, 1000)
            if (newMessage.content.length > 1000) {
                trimmedNew = trimmedNew + '...'
            }
            const embed = new Discord.RichEmbed()
                .setTitle('Message Updated')
                .setAuthor(newMessage.author.tag, newMessage.author.displaydisplayAvatarURL)
                .addField('Channel', newMessage.channel)
                .addField('Old message content', trimmedOld)
                .addField('New message Content', trimmedNew)
                .setColor('#cffc03')
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
            if (typeof client.channels.get(settings.logChannels.messageUpdate) != 'undefined') {
                client.channels.get(settings.logChannels.messageUpdate).send(embed)
            } else {
                return bot.emit('missingLogChannel', settings.logChannels.messageUpdate, newMember.guild, 'messageUpdate')
            }
        }
    }
})
client.on('emojiCreate', emoji => {
    let settingsExist = fs.existsSync(`./data/${emoji.guild.id}.json`)
    var settings = JSON.parse(fs.readFileSync(`./data/${emoji.guild.id}.json`, 'utf8'))
    if (typeof settings.logChannels.emojiCreate != 'undefined') {
        if (settingsExist) {
            emoji.fetchAuthor().then(user => {
                const embed = new Discord.RichEmbed()
                    .setAuthor(user.tag, user.displayAvatarURL)
                    .setColor('#00ff00')
                    .setDescription(emoji.toString())
                    .setTitle('Emoji Created')
                    .addField('Name', emoji.name)
                    .addField('Animated', emoji.animated)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL)
                if (typeof client.channels.get(settings.logChannels.emojiCreate) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.emojiCreate, emoji.guild, 'emojiCreate')
                client.channels.get(settings.logChannels.emojiCreate).send(embed)
            })
        }
    }
})
client.on('emojiDelete', emoji => {
    let settingsExist = fs.existsSync(`./data/${emoji.guild.id}.json`)
    var settings = JSON.parse(fs.readFileSync(`./data/${emoji.guild.id}.json`, 'utf8'))
    if (typeof settings.logChannels.emojiDelete != 'undefined') {
        if (settingsExist) {
            const embed = new Discord.RichEmbed()
                .setAuthor(emoji.guild.name, emoji.guild.iconURL)
                .setColor('#ff0000')
                .setDescription(emoji.toString())
                .setTitle('Emoji Deleted')
                .addField('Name', emoji.name)
                .addField('Animated', emoji.animated)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL)
            if (typeof client.channels.get(settings.logChannels.emojiDelete) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.emojiDelete, emoji.guild, 'emojiDelete')
            client.channels.get(settings.logChannels.emojiDelete).send(embed)
        }
    }
})
client.on('emojiUpdate', (Oldemoji, emoji) => {
    let settingsExist = fs.existsSync(`./data/${emoji.guild.id}.json`)
    var settings = JSON.parse(fs.readFileSync(`./data/${emoji.guild.id}.json`, 'utf8'))
    if (typeof settings.logChannels.emojiUpdate != 'undefined') {
        if (settingsExist) {
            const embed = new Discord.RichEmbed()
                .setAuthor(emoji.guild.name, emoji.guild.iconURL)
                .setColor('#4287f5')
                .setDescription(emoji.toString())
                .setTitle('Emoji Updated')
                .addField('Name (before)', Oldemoji.name)
                .addField('Name (after)', emoji.name)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL)
            if (typeof client.channels.get(settings.logChannels.emojiUpdate) == 'undefined') return bot.emit('missingLogChannel', settings.logChannels.emojiUpdate, emoji.guild, 'emojiUpdate')
            client.channels.get(settings.logChannels.emojiUpdate).send(embed)
        }
    }
})
client.on('guildDelete', guild => {
    try {
        fs.unlink(`./data/${guild.id}.json`, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
    } catch (error) {
        console.log(error)
    }
})
client.on('guildCreate', guild => {
    let rawData = JSON.parse(fs.readFileSync('defaultServerSettings.json', 'utf8'))
    let data = JSON.stringify(rawData, null, 2)
    fs.writeFile('./data/' + guild.id + '.json', data, (err) => {
        try {
            if (err) throw err
            console.log('Setting created for new server.')
        } catch (error) {
            guild.systemChannel.send(`An Error occured.. \n\n \`${error.name}:${error.message}\``)
            console.log(error)
        }
    })
})

client.on('error', console.error)
client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
    client.user.setActivity(`${config.prefix}help | ${client.guilds.size} server(s)`)
})
function sendError(error, receivedMessage) {
    let message = receivedMessage.channel.send(`An Error occured.. \n\n \`\`\`prolog\n${error.stack}\`\`\``)
    console.log(error)
    return message
}
function botError(message) {
    var error = new Error(message)
    error.name = 'NickChanBotError'
    return error
}
function processCommand(receivedMessage, serverSettings, processStart) {
    try {
        let fullCommand = receivedMessage.content.substr(1) // Remove the prefix
        let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
        let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
        let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command
        const serverQueue = queue.get(receivedMessage.guild.id); //Music queue
        console.log(`${receivedMessage.author.tag} has sent a command`)
        console.log(" Command received: " + primaryCommand)
        console.log(" Arguments: " + arguments) // There may not be any arguments

        if (primaryCommand == "help") {
            helpCommand(arguments, receivedMessage)
        } else if (primaryCommand == "multiply") {
            multiplyCommand(arguments, receivedMessage)
        } else if (primaryCommand == "spam") {
            spamCommand(arguments, receivedMessage)
        } else if (primaryCommand == "spam-ping") {
            spamPingCommand(arguments, receivedMessage)
        } else if (primaryCommand == "changelogs") {
            ChangelogsCommand(receivedMessage)
        } else if (primaryCommand == "kick") {
            kickCommand(arguments, receivedMessage)
        } else if (primaryCommand == "about") {
            aboutCommand(receivedMessage)
        } else if (primaryCommand == "ping") {
            pingCommand(receivedMessage, processStart)
        } else if (primaryCommand == "ban") {
            banCommand(arguments, receivedMessage)
        } else if (primaryCommand == "purge") {
            purgeCommand(arguments, receivedMessage)
        } else if (primaryCommand == "reconnect") {
            reconnectCommand(receivedMessage)
        } else if (primaryCommand == "8ball") {
            eightBallCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'dog') {
            dogCommand(receivedMessage)
        } else if (primaryCommand == 'unban') {
            unbanCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'say') {
            sayCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'cat') {
            catCommand(receivedMessage)
        } else if (primaryCommand == 'randomstring') {
            randomStringCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'randomelement') {
            randomElementCommand(receivedMessage)
        } else if (primaryCommand == 'server-info') {
            serverInfoCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'logs') {
            logsCommand(receivedMessage)
        } else if (primaryCommand == 'stats') {
            statsCommand(receivedMessage)
        } else if (primaryCommand == 'googlesearch') {
            googleSearchCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'set-talk-channel') {
            setTalkChannelCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'eval') {
            evalCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'config') {
            configCommand(arguments, receivedMessage, serverSettings)
        } else if (primaryCommand == 'embed-spam') {
            embedSpamCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'user-info') {
            userInfoCommand(arguments, receivedMessage)
        } else if (primaryCommand == 'nekos-life') {
            nekosLifeCommand(arguments, receivedMessage)
        } else if (primaryCommand == `play`) {
            execute(receivedMessage, serverQueue);
        } else if (primaryCommand == (`skip`)) {
            skip(receivedMessage, serverQueue);
        } else if (primaryCommand == (`stop`)) {
            stop(receivedMessage, serverQueue);
        } else if (primaryCommand == (`queue`)) {
            queueCommand(receivedMessage, serverQueue, arguments)
        } else if (primaryCommand == (`now-playing`)) {
            nowPlaying(receivedMessage, serverQueue)
        }
    } catch (error) {
        sendError(error, receivedMessage)
    }
}
function evalCommand(arguments, receivedMessage) {
    try {
        if (receivedMessage.author.id != '570634232465063967') {
            receivedMessage.channel.send('You don\'t have the permission to use this command!')
                .then(m => m.delete(5000))
            receivedMessage.react('🚫')
            receivedMessage.delete(5000)
            return
        }
        eval(arguments.slice(0).join(' '))
    } catch (error) {
        sendError(error, receivedMessage)
    }
}
async function googleSearchCommand(arguments, receivedMessage) {
    receivedMessage.channel.send('Searching for:`' + arguments.slice(0).join(' ') + '`')
    googleIt({ 'query': arguments.slice(0).join(' ') })
        .then(results => {
            var orderedResult = JSON.stringify(results, null, 2)
            receivedMessage.channel.send(`\`\`\`json\n${orderedResult}\`\`\``)
                .then(m => {
                    receivedMessage.channel.send('Search time is:' + (m.createdTimestamp - receivedMessage.createdTimestamp) + 'ms')
                })
        })
        .catch(error => {
            sendError(error, receivedMessage)
        });
}
function setTalkChannelCommand(arguments, receivedMessage) {
    if (receivedMessage.author.id != '570634232465063967') {
        return
    }
    talkChannel = arguments[0]
    talkChannelOn = true
    receivedMessage.channel.send(`Operation Completed.`)
}
function processTrigger(receivedMessage) {
    let Trigger = receivedMessage.content.substr(0)
    if (Trigger == '<@!610070268198780947>' || Trigger == '<@610070268198780947>') {
        introTrigger(receivedMessage)
    } else {
        return
    }
}
function introTrigger(receivedMessage) {
    receivedMessage.channel.send(`Hi! my prefix is \`${config.prefix}\` \n To get started type \`/help\``)
}
async function reconnectCommand(receivedMessage) {
    if (receivedMessage.author.id == "570634232465063967") {
        receivedMessage.channel.send('Reconnecting...')
            .then(() => {
                client.destroy()
                    .then(() => {
                        client.login(config.token)
                            .catch(error => {
                                console.log('Unable to reconnect')
                                console.log(error.stack)
                            })
                            .then(() => {
                                receivedMessage.channel.send('Successfully reconnected')
                            });
                    })

            })
    } else {
        receivedMessage.channel.send("Only the bot onwer can reload the bot")
    }
}
function helpCommand(arguments, receivedMessage) {
    if (arguments == "multiply") {
        receivedMessage.channel.send("Description : Multiply two or more numbers \n Usage:`multiply [number]  [number]  \( [number]...\)`")
    } else if (arguments == "help") {
        receivedMessage.channel.send("Description : get help about the bot or a specific command \n Usage: `help \([String]\)`")
    } else if (arguments == "spam") {
        receivedMessage.channel.send("Description: Spams \n Usage: `spam [number]`")
    } else if (arguments == "spam-ping") {
        receivedMessage.channel.send("Description: Spam pinging everyone \n Usage: `spam-ping [number]`")
    } else if (arguments == "changelogs") {
        receivedMessage.channel.send("Changelogs of the bot.")
    } else if (arguments == "kick") {
        receivedMessage.channel.send("Description:Kicks a member \n Usage:Kick [member] ([reason])")
    } else if (arguments == "About") {
        receivedMessage.channel.send("Description:Send a README.md file about the bot \n Usage: `About`")
    } else if (arguments == "ping") {
        receivedMessage.channel.send("Description : returns latency")
    } else if (arguments == "ban") {
        receivedMessage.channel.send(`Description:bans a member. Usage: \`ban [mention] ([reason])\``)
    } else if (arguments == "purge") {
        receivedMessage.channel.send("Description: bulk delete messages \n Usage: purge [count]")
    } else if (arguments == '8ball') {
        receivedMessage.channel.send('Description: Ask 8ball a question \n Usage: 8ball [question]')
    } else if (arguments == 'dog' || arguments == 'cat') {
        receivedMessage.channel.send(`Description:send a photo of a ${arguments[0]} \n Usage: ${arguments[0]}`)
    } else if (arguments == ('say')) {
        receivedMessage.channel.send('Description:Use the bot to say something \n Usage: `say [message]`')
    } else if (arguments == 'randomstring') {
        receivedMessage.channel.send('Description: Send an random string in chat. \n Usage: `randomstring [count]`')
    } else if (arguments == 'randomelement') {
        receivedMessage.channel.send('Description: Returns an random element \n Usage: `randomelement`')
    } else if (arguments == 'server-info') {
        receivedMessage.channel.send('Description:returns server info \n Usage: `server-info [detailed|json]`')
    } else if (arguments == 'logs') {
        receivedMessage.channel.send('Description:returns bot logs \n Usage: `logs`')
    } else if (arguments == 'unban') {
        receivedMessage.channel.send(`Description:unbans a user. Usage: \`unban <User ID> [reason]\``)
    } else if (arguments == "") {
        //Send the attachment in the message channel
        const attachment = new Discord.Attachment('./attachments/README.md');
        /*
        MAIN HELP
            commands available to public only
        */
        receivedMessage.channel.send("Prefix :`" + config.prefix + "` \n \n __**Command list**__ \n`help` `nekos-life` `randomstring` `stats` `config` `embed-spam` `user-info` `play` `skip` `stop` `now-playing` `queue` `multiply` `dog` `cat` `spam` `logs` `server-info` `say` `8ball` `unban` `spam-ping` `kick` `ban` `purge` `about` `changelogs` `Ping` `googlesearch` \n Use `/help [string]` for more infromation on a specificed command. Arguments in [] are optional \n \n __**Support Server**__ \n https://discord.gg/kPMK3K5")
        receivedMessage.channel.send(attachment)
    } else if (arguments == 'googsearch') {
        receivedMessage.channel.send('Google something \n Usage `googlesearch <query>`')
    } else if (arguments == 'config') {
        receivedMessage.channel.send('Description:Change server settings\nUsage `config <config category> <config item> <new value>`\n**__Category:`log-channels`__** Sets the log channels\nIn this category `<new value>` must be a channel mention. \nList of `<config item>`s\n\n`startTyping` Logged when someone starts typing\n`stopTyping` Logged when someone stops typing\n`message` Logged when someone sends a message\n`messageDelete` Logged when someone deletes a message\n`messageDeleteBulk` Logged when someone bulk delete messages\n`messageUpdate` Logged when a message is updated\n`channelCreate` Logged when a channel is created\n`channelDelete` Logged when achannel is deleted\n`channelUpdate` Logged when a channel is updated\n`guildBanAdd` Logged when someone is banned\n`guildBanRemove` Logged when someone is unbanned\n`guildMemberAdd` Logged when someone joins the server\n`guildMemebrRemove` Logged when someone leaves the server.\n`error` Logged when the bot encouters an error wjile doing something on the server.\n`emojiCreate` Logged when a emoji is craeted.\n`emojiDelete`Logged when an emoji is deleted\n`emojiUpdate`Logged when an emoji is updated.')
    } else if (arguments == 'stats') {
        receivedMessage.channel.send('Description:Return bot statistics\nUsage:`stats`')
    } else if (arguments == 'play') {
        receivedMessage.channel.send('Description:plays music\nUsage:`play <youtube url>`')
    } else if (arguments == 'skip') {
        receivedMessage.channel.send('Description:Skip the current song\nUsage:`skip`')
    } else if (arguments == 'stop') {
        receivedMessage.channel.send('Description:Stop playing music,including those that are in the queue.\nUsage:`stop`')
    } else if (arguments == 'nekos-life') {
        const SFWImages = ["smug", "baka", "tickle", "slap", "poke", 'pat', 'neko', 'nekoGif', 'meow', 'lizard', 'kiss', 'hug', 'foxGirl', 'feed', 'cuddle']
        const NSFWImages = ["lewdkemo", "lewdk", "keta", "hololewd", "holoero", "hentai", "futanari", "femdom", "feetg", "erofeet", "feet", "ero", "erok", "erokemo", "eron", "eroyuri", "cum_jpg", "blowjob", "pussy"]
        receivedMessage.channel.send('Description:Fetch a image from nekos.life \nUsage:`nekos-life <argument>`\nAvailable arguments:')
        receivedMessage.channel.send('SFW:\n`' + SFWImages.join('` `') + '`' + '\nNSFW:\n`' + NSFWImages.join('` `') + '`')
    } else if (arguments == 'user-info') {
        receivedMessage.channel.send('Description:Shows user info.\nUsage:`user-info [User ID|@mention|Tag|Username]`')
    } else if (arguments == 'embed-spam') {
        receivedMessage.channel.send('Description:Spams embed.\nUsage:`embed-spam <count>`')
    } else if (arguments == 'now-playing') {
        receivedMessage.channel.send('Description:Shows the song that is playing\nUsage:`now-playing`')
    } else if (arguments == 'queue') {
        receivedMessage.channel.send('Description:Shows the server queue/song with a specified position in queue\nUsage:`queue [position]`')
    } else {
        receivedMessage.channel.send('Incorrect command syntax. Usage:`help [command]`')
    }
}
async function configCommand(arguments, receivedMessage, serverSettings) {
    try {
        if (receivedMessage.guild == null) throw botError('Using server-only commands in DM channel.')
    } catch (error) {
        sendError(error, receivedMessage)
        return
    }
    if (!receivedMessage.member.hasPermission('MANAGE_GUILD')) return receivedMessage.channel.send(noPermission('manage server'))
    let path = './data/' + receivedMessage.guild.id + '.json'
    if (arguments[0] == 'view') {
        receivedMessage.channel.send(`\`\`\`json\n${JSON.stringify(serverSettings, null, 2)}\`\`\``)
        return
    } else if (arguments[0] == 'log-channels') {
        try {
            if (arguments[2] != receivedMessage.mentions.channels.first()) throw botError('Invalid Commadn Syntax.')
            if (arguments[2] == '') throw botError('Invalid Commadn Syntax.')
            const cObj = await receivedMessage.mentions.channels.first()
            const c = cObj.id
            if (arguments[1] == 'startTyping') {
                serverSettings.logChannels.startTyping = c
            } else if (arguments[1] == 'stopTyping') {
                serverSettings.logChannels.stopTyping = c
            } else if (arguments[1] == 'message') {
                serverSettings.logChannels.message = c
            } else if (arguments[1] == 'messageDelete') {
                serverSettings.logChannels.messageDelete = c
            } else if (arguments[1] == 'messageDeleteBulk') {
                serverSettings.logChannels.messageDeleteBulk = c
            } else if (arguments[1] == 'guildMemberAdd') {
                serverSettings.logChannels.guildMemberAdd = c
            } else if (arguments[1] == 'channelCreate') {
                serverSettings.logChannels.channelCreate = c
            } else if (arguments[1] == 'channelDelete') {
                serverSettings.logChannels.channelDelete = c
            } else if (arguments[1] == 'channelPinsUptdate') {
                serverSettings.logChannels.channelPinsUpdate = c
            } else if (arguments[1] == 'channelUpdate') {
                serverSettings.logChannels.channelUpdate = c
            } else if (arguments[1] == 'emojiCreate') {
                serverSettings.logChannels.emojiCreate = c
            } else if (arguments[1] == 'emojiDelete') {
                serverSettings.logChannels.emojiDelete = c
            } else if (arguments[1] == 'emojiUpdate') {
                serverSettings.logChannels.emojiUpdate = c
            } else if (arguments[1] == 'guildBanAdd') {
                serverSettings.logChannels.guildBanAdd = c
            } else if (arguments[1] == 'guildBanRemove') {
                serverSettings.logChannels.guildBanRemove = c
            } else if (arguments[1] == 'guildIntegrationsUpdate') {
                serverSettings.logChannels.guildIntegrationsUpdate = c
            } else if (arguments[1] == 'guildMemberRemove') {
                serverSettings.logChannels.guildMemberRemove = c
            } else if (arguments[1] == 'guildMemberUpdate') {
                serverSettings.logChannels.guildMemberUpdate = c
            } else if (arguments[1] == 'guildUpdate') {
                serverSettings.logChannels.guildUpdate = c
            } else if (arguments[1] == 'messageDeleteBulk') {
                serverSettings.logChannels.messageDeleteBulk = c
            } else if (arguments[1] == 'messageReactionAdd') {
                serverSettings.logChannels.messageReactionAdd = c
            } else if (arguments[1] == 'messageReactionRemove') {
                serverSettings.logChannels.messageReactionRemove = c
            } else if (arguments[1] == 'messageReactionRemoveAll') {
                serverSettings.logChannels.messageReactionRemoveAll = c
            } else if (arguments[1] == 'messageUpdate') {
                serverSettings.logChannels.messageUpdate = c
            } else if (arguments[1] == 'roleCreate') {
                serverSettings.logChannels.roleCreate = c
            } else if (arguments[1] == 'roleDelete') {
                serverSettings.logChannels.roleDelete = c
            } else if (arguments[1] == 'roleUpdate') {
                serverSettings.logChannels.roleUpdate = c
            } else if (arguments[1] == 'webhookUpdate') {
                serverSettings.logChannels.emojiUpdate = c
            } else if (arguments[1] == 'error') {
                serverSettings.logChannels.error = c
            } else {
                throw botError('Unknown settings')
            }
        } catch (error) {
            sendError(error, receivedMessage)
            return
        }
    } else if (arguments[0] == 'others') {
        if (arguments[1] == 'welcomeMessage') {
            if (!arguments[2]) {
                try {
                    throw botError('Cannot be empty!')
                } catch (error) {
                    sendError(error, receivedMessage)
                    return
                }
            } else {
                serverSettings.welcomeMessage = arguments.slice(2).join(' ')
            }
        } else if (arguments[1] == 'leavingMessage') {
            if (!arguments[2]) {
                try {
                    throw botError('Cannot be empty!')
                } catch (error) {
                    sendError(error, receivedMessage)
                    return
                }
            } else {
                serverSettings.leavingMessage = arguments.slice(2).join(' ')
            }
        }

    } else {
        return receivedMessage.channel.send('Unknown config')
    }
    fs.writeFileSync(path, JSON.stringify(serverSettings, null, 2))
    receivedMessage.channel.send('Overwrote server settings')
}
function multiplyCommand(arguments, receivedMessage) {
    if (arguments.length < 2) {
        receivedMessage.channel.send("Not enough values to multiply. Try `/multiply 2 4 10` or `/multiply 5.2 7`")
        return
    }
    let product = 1
    arguments.forEach((value) => {
        product = product * parseFloat(value)
    })
    receivedMessage.channel.send("The product of " + arguments + " multiplied together is: " + product.toString())
}

function spamCommand(arguments, receivedMessage) {
    if (!receivedMessage.member.hasPermission('MANAGE_MESSAGES')) return receivedMessage.channel.send(noPermission('manage messages'))
    var num = arguments[0]
    var num1 = parseInt(num);
    if (num1 > 50000) {
        receivedMessage.channel.send("  Value too large.Must be smaller than 50000.")
        console.log(" Input value too large")
        return
    }
    var i;
    var spamCount = 1
    var spamming = true
    for (i = 0; i < num1; i++) {
        if (spamming) {
            client.on('message', (stopMessage) => {
                try {
                    if (stopMessage.author.bot) return
                    if (stopMessage.content == '/stop')
                        throw botError('Command is force stopped.')
                } catch (error) {
                    sendError(error, receivedMessage)
                    return
                }
            })
        }
        receivedMessage.channel.send("Spamming...  count:" + spamCount + "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.");
        spamCount += 1
    }
}

function spamPingCommand(arguments, receivedMessage) {
    if (!receivedMessage.member.hasPermission('MANAGE_MESSAGES') || !receivedMessage.member.hasPermission('MENTION_EVERYONE')) return receivedMessage.channel.send(noPermission('manage messages, mention everyone'))
    var num = arguments[0]
    var num1 = parseInt(num);
    if (num1 > 50000) {
        receivedMessage.channel.send("Value too large.Must be smaller than 50000.")
        console.log("Input value too large")
        return
    }
    var i;
    var spamCount = 1
    var spamming = true
    for (i = 0; i < num1; i++) {
        receivedMessage.channel.send("Spamming...  count:" + spamCount + "\n @everyone")
            .catch(error => {
                console.log(error)
                return
            });
        if (spamming) {
            client.on('message', (stopMessage) => {
                try {
                    if (stopMessage.author.bot) return
                    if (stopMessage.content == '/stop')
                        throw botError('Command is force stopped.')
                } catch (error) {
                    sendError(error, receivedMessage)
                    return
                }
            })
        }
        spamCount += 1
    }
}
function ChangelogsCommand(receivedMessage) {
    receivedMessage.channel.send("Nick Chan Bot Beta 1.0.0 - pre11 \n **CHANGELOGS** \n ```-Added /play,/now-playing,/stop,/skip,/config,/embed-spam,/stats,/user-info,/nekos-life\n-255 character limit on /randomstring lifted\n-Added a logging system\n-Contiune to update documnation\n-Other minor improvements\n-Added a handler for missing log channels\nNSFW content is no longer available in DM\n-The bot will create a HTTP server on startup\n-Updated documentation\n-More log items```")
}
function kickCommand(arguments, receivedMessage) {
    if (receivedMessage.guild == null) return receivedMessage.channel.send('This command can only be used in servers');
    if (!receivedMessage.member.hasPermission('KICK_MEMBERS')) return receivedMessage.channel.send(noPermission('kick members'));

    if (!receivedMessage.mentions.members.first() || receivedMessage.mentions.members.first() != arguments[0]) return receivedMessage.channel.send('Invalid command syntax. Usage: `kick <member> [reason]`');

    const taggedUser = receivedMessage.mentions.members.first()
    if (taggedUser.id == receivedMessage.author.id) return receivedMessage.channel.send('Why would you wanna kick yourself? I do not allow self harm.');
    if (receivedMessage.member.highestRole.comparePositionTo(taggedUser.highestRole) <= 0 && receivedMessage.member.id != receivedMessage.guild.owner.id) return receivedMessage.channel.send('You cannot kick this user because they have a higher or equal role compared to you.');

    if (taggedUser.id == receivedMessage.guild.owner.id) return receivedMessage.channel.send('Cannot kick the server owner!');

    if (!taggedUser.kickable) return receivedMessage.channel.send('The bot does not have permissions to kick this user. Check that I have permissions to kick members and my role is above the member you are trying to kick.')
    let reason = arguments.slice(1).join(' ')
    if (!reason) reason = "No reason specified"
    taggedUser.kick(reason)
        .catch(error => {
            console.log(error)
            return
        });
    receivedMessage.channel.send(`Successfully kicked ${taggedUser.user.tag}. Reason: ${reason}`)
}
function banCommand(arguments, receivedMessage) {
    if (receivedMessage.guild == null) return receivedMessage.channel.send('This command can only be used in servers');
    if (!receivedMessage.member.hasPermission('BAN_MEMBERS')) return receivedMessage.channel.send(noPermission('ban members'));

    if (!receivedMessage.mentions.members.first() || receivedMessage.mentions.members.first() != arguments[0]) return receivedMessage.channel.send('Invalid command syntax. Usage: `ban <member> [reason]`');

    const taggedUser = receivedMessage.mentions.members.first()
    if (taggedUser.id == receivedMessage.author.id) return receivedMessage.channel.send('Why would you wanna ban yourself? I do not allow self harm.');

    if (receivedMessage.member.highestRole.comparePositionTo(taggedUser.highestRole) <= 0 && receivedMessage.member.id != receivedMessage.guild.owner.id) return receivedMessage.channel.send('You cannot ban this user because they have a higher or equal role compared to you.');

    if (taggedUser.id == receivedMessage.guild.owner.id) return receivedMessage.channel.send('Cannot ban the server owner!');

    if (!taggedUser.kickable) return receivedMessage.channel.send('The bot does not have permissions to ban this user. Check that I have permissions to ban members and my role is above the member you are trying to ban.')
    let reason = arguments.slice(1).join(' ')
    if (!reason) reason = "No reason specified"
    taggedUser.ban(reason)
        .catch(() => receivedMessage.channel.send('Oops, an error occured while trying to ban this person.'));
    receivedMessage.channel.send(`Successfully banned ${taggedUser.user.tag}. Reason: ${reason}`)
}

function aboutCommand(receivedMessage) {
    receivedMessage.channel.send("Nick Chan Bot is a bot made by Nick Chan#0001[570634232465063967].\nCredits:\n```\n-Favian#8324[400581909912223744] (Developement)\n-RandomPerson0244#0244[549471563616092171] (Developement)```");
}
function pingCommand(receivedMessage, processStart) {
    let time = Date.now() - processStart
    receivedMessage.channel.send(`Pinging...`).then(m => {
        m.edit(
            `:ping_pong: Wew, made it over the ~waves~ ! **Pong!**\nMessage edit time:` +
            (m.createdTimestamp - receivedMessage.createdTimestamp) +
            `ms \n  Discord API heartbeat:` +
            Math.round(client.ping) +
            `ms\n Command process time:` + time + 'ms'
        );
    });
}
async function purgeCommand(arguments, receivedMessage) {
    if (receivedMessage.guild == null) return receivedMessage.channel.send('This command can only be used in servers');
    if (!receivedMessage.member.hasPermission("MANAGE_MESSAGES")) {
        receivedMessage.channel.send(noPermission('manage messages'))
        return
    }
    if (arguments[0] == null) return receivedMessage.delete()
    if (arguments[0] > 10000) return receivedMessage.channel.send('Please use a value that is smaller than 10000.')
    var count = parseInt(arguments[0]) + 1
    while (count > 100) {
        await receivedMessage.channel.bulkDelete(100, true)
            .catch((error) => {
                console.log(error)
                return
            });
        count = count - 100
    }
    await receivedMessage.channel.bulkDelete(count, true)
        .catch((error) => {
            console.log(error)
            return
        });
}
function eightBallCommand(arguments, receivedMessage) {
    if (arguments == '') {
        receivedMessage.channel.send("Please enter something for 8ball to answer.")
        return
    }
    let answer = eightballRandCommand()
    receivedMessage.channel.send('8ball answered with:' + answer)
}
function eightballRandCommand() {
    var answers = ['Yes', 'No', 'Maybe', 'You may rely on it', 'Probably not', 'It is decidely so.', 'never']
    return answers[Math.floor(Math.random() * answers.length)];
}
function dogCommand(receivedMessage) {
    let dogs = fs.readdirSync('./attachments/cats')
    let dog = dogs[Math.floor(Math.random() * dogs.length)]
    const attachment = new Discord.Attachment('./attachments/dogs/' + dog)
    receivedMessage.channel.send(attachment)
}
function catCommand(receivedMessage) {
    let cats = fs.readdirSync('./attachments/cats')
    let cat = cats[Math.floor(Math.random() * cats.length)]
    const attachment = new Discord.Attachment('./attachments/cats/' + cat)
    receivedMessage.channel.send(attachment)
}
async function unbanCommand(arguments, receivedMessage) {
    if (receivedMessage.guild == null) return receivedMessage.channel.send('This command can only be used in servers');
    if (!receivedMessage.member.hasPermission('BAN_MEMBERS') && !receivedMessage.member.hasPermission("ADMINISTRATOR")) return receivedMessage.channel.send('You cannot unban users.')
    if (!receivedMessage.guild.me.hasPermission('BAN_MEMBERS')) return receivedMessage.channel.send('Please check if the bot has the permissions to unban members.')
    try {
        let bannedUser = await client.fetchUser(arguments[0])
        let reason = arguments.slice(1).join(' ')
        if (!reason) reason = "No reason specified"
        await receivedMessage.guild.unban(bannedUser, reason).catch(error => {
            throw error
        })
        receivedMessage.channel.send(`Successfully unbanned ${bannedUser}.`)
    } catch (error) {
        sendError(error, receivedMessage)
    }
}
function sayCommand(arguments, receivedMessage) {
    if (!arguments.slice(0)) return receivedMessage.channel.send('Please enter something for the bot to say.')
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] == '@everyone' || arguments[i] == '@here') {
            receivedMessage.channel.send('Please remove the mass mention and try again.')
            console.log('Mass mention detected')
            return
        }
    }
    receivedMessage.channel.send(arguments.slice(0).join(' '))
}
function randomStringCommand(arguments, receivedMessage) {
    if (arguments[0] <= 1048576) {
        let str = randomString(arguments[0])
        if (arguments[0] <= 2000 && arguments[0] > 0) {
            receivedMessage.channel.send(str)
        }
        fs.writeFileSync('./temp/str.txt', str)
        receivedMessage.channel.send(new Discord.Attachment('./temp/str.txt'))
    } else {
        receivedMessage.channel.send('Value out of range. Must between 1 and 1048576')
    }

}
function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function randomElementCommand(receivedMessage) {
    var elements = ['Hydrogen', 'Helium ', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon', 'Sodium', 'Magnesium', 'Aluminum', 'Silicon', 'Phosphrous', 'Sulphur', 'Chlorine', 'Argon', 'Potassium', 'Calcium', 'Scandium', 'Titanium', 'Vanadium', 'Chromium', 'Manganese', 'Iron', 'Cobalt', 'Nickel', 'Copper', 'Zinc', 'Gallium', 'Germanium', 'Arsenic', 'Selenium', 'Bromine', 'Krypton', 'Rubidium', 'Stronium', 'Yttrium', 'Zironium', 'Niobium', 'Molybdenum', 'Technetium', 'Ruthenium', 'Rhodium', 'Palladium', 'Silver', 'Candmium', 'Indium', 'Tin', 'Antimony', 'Tellurium', 'Iodine', 'Xenon', 'Caesium', 'Barium', 'Lanthanum', 'Cerium', 'Praseodymium', 'Neodymium', 'Promethium', 'Samarium', 'Europium', 'Gadolinium', 'Terbium', 'Dysprosium', 'Holonium', 'Erbium', 'Thulium', 'Ytterium', 'Lutetium', 'Hafnium', 'Tantalum', 'Tungsten', 'Rhenium', 'Osmium', 'Iridium', 'Platnium', 'Gold', 'Mercury', 'Thallium', 'Lead', 'Bismuth', 'Polonium', 'Astatine', 'Radon', 'Francium', 'Radium', 'Actnium', 'Thorium', 'Protactium', 'Uranium', 'Neptunium', 'Plutonium', 'Americium', 'Curium', 'Berklium', 'Californiium', 'Eistenium', 'Fermium', 'Mendelevium', 'Nobelium', 'Lawrencium', 'Rutherfordium', 'Dubnium', 'Seaborgium', 'Bohrium', 'Hassium', 'Meitnerium', 'Darmstadtium', 'Roentgenium', 'Copernicium', 'Nihonium', 'Flevorium', 'Moscovium', 'Livermorium', 'Tennessine', 'Oganesson',]
    var result = elements[Math.floor(Math.random() * elements.length)];
    receivedMessage.channel.send(result)
}
async function serverInfoCommand(arguments, receivedMessage) {
    const g = receivedMessage.guild
    const e = '\n'
    if (arguments[0] == 'detailed') {
        let info = 'AFK Channel:' + g.afkChannel + e + 'AFK Channel ID:' + g.afkChannelID + e + 'Application ID:' + g.applicationID + e + 'Availbility:' + g.available + e + 'Created at:' + g.createdAt + e + 'Created Timestamp:' + g.createdTimestamp + e + 'default Message Notifications:' + g.defaultMessageNotifications + e + '`@everyone` role:' + '`' + g.defaultRole + '`' + e + 'Deleted:' + g.deleted + e + 'explicit Content Filter:' + g.explicitContentFilter + e + 'Server icon hash:' + g.icon + e + 'Server ID: ' + g.id + e + 'Server icon URL:' + g.iconURL + e + `Large?: ${g.large} \n Member count: ${g.memberCount} \n MFA Level: ${g.mfaLevel} \n Server name: ${g.name} \n Server name acronym: ${g.nameAcronym} \n Server owner: ${g.owner.user.tag} \n Server owner ID: ${g.ownerID} \n Server region: ${g.region} \n Sever splsah screen hash: ${g.splash} \n Server splash screen URL: ${g.splashURL} \n System Channel: <#${g.systemChannelID}> \n System Channel ID: ${g.systemChannelID} \n Verification Level : ${g.verificationLevel} \n Verified?: ${g.verified}`
        await receivedMessage.channel.send(`**Server Info** \n \n` + info)
    } else if (arguments[0] == 'json') {
        receivedMessage.channel.send('```js\n' + JSON.stringify(g, null, 2) + '```')
    } else {
        let info = 'AFK Channel:' + g.afkChannel + 'Created at:' + g.createdAt + e + 'Server ID: ' + g.id + e + 'Server icon URL:' + g.iconURL + e + `Large?: ${g.large} \n Member count: ${g.memberCount} \n MFA Level: ${g.mfaLevel} \n Server name: ${g.name} \n Server name acronym: ${g.nameAcronym} \n Server owner: ${g.owner.user.tag} \n Server region: ${g.region}\n Server splash screen URL: ${g.splashURL} \n System Channel: <#${g.systemChannelID}> \n System Channel ID: ${g.systemChannelID} \n Verification Level : ${g.verificationLevel} \n Verified?: ${g.verified}`
        await receivedMessage.channel.send(`**Server Info** \n \n` + info)
    }

}
function statsCommand(receivedMessage) {
    const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
    receivedMessage.channel.send(`= STATISTICS =
  • Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
  • Uptime     :: ${duration}
  • Users      :: ${client.users.size.toLocaleString()}
  • Servers    :: ${client.guilds.size.toLocaleString()}
  • Channels   :: ${client.channels.size.toLocaleString()}
  • Discord.js :: v${Discord.version}
  • Node       :: ${process.version}`, { code: "asciidoc" });
};

function embedSpamCommand(arguments, receivedMessage) {
    if (!receivedMessage.member.hasPermission('MANAGE_MESSAGES')) return receivedMessage.channel.send(noPermission('manage messages'))
    var num = arguments[0]
    var num1 = parseInt(num);
    if (num1 > 300) {
        receivedMessage.channel.send("  Value too large.Must be smaller than 300.")
        console.log(" Input value too large")
        return
    }
    var i;
    let embed = new Discord.RichEmbed()
        .setAuthor(receivedMessage.author.tag, receivedMessage.author.displaydisplayAvatarURL)
        .setImage(receivedMessage.author.displaydisplayAvatarURL)
        .setThumbnail(receivedMessage.author.displaydisplayAvatarURL)
        .setTimestamp()
        .addField('x.', '2.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.ytjjt')
        .addField('.x', '2.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.ytjjt')
        .addField('.x', '2.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.ytjjt')
        .setURL(receivedMessage.author.displaydisplayAvatarURL)
        .setColor('#000000')
        .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
        .setDescription('.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.')
    for (i = 0; i < num1; i++) {
        receivedMessage.channel.send(embed);
    }
}
function logsCommand(receivedMessage) {
    let logs = new Discord.Attachment('logs.txt')
    receivedMessage.channel.send(logs)
}
async function userInfoCommand(arguments, receivedMessage) {
    var user = undefined
    if (arguments[0]) {
        try {
            user = await client.fetchUser(arguments[0])
        } catch (error) {
            if (receivedMessage.mentions.members.first()) {
                if (user == null || typeof user == 'undefined') user = receivedMessage.mentions.members.first().user
            }
            if (user == null || typeof user == 'undefined') user = client.users.find(x => x.tag == arguments.slice(0).join(' '))
            if (user == null || typeof user == 'undefined') user = client.users.find(x => x.username == arguments.slice(0).join(' '))
            if (user == null || typeof user == 'undefined') user = client.users.find(x => x.discriminator == arguments.slice(0).join(' '))
        }
    } else {
        user = receivedMessage.author
    }
    if (user == null || typeof user == 'undefined') return receivedMessage.channel.send('Unknown user.')
    let embed = new Discord.RichEmbed()
        .setAuthor(receivedMessage.author.tag, receivedMessage.author.displaydisplayAvatarURL)
        .setTitle('User Info')
        .setDescription('Note:Some information cannot be displayed if the user is offline/Not playing a game/Not streaming/Not a human\nThe only reliable way of using this command is using the user ID as argument')
        .addField('Tag', user.tag)
        .addField('Is Bot', user.bot)
        .addField('Joined Discord', user.createdAt)
        .addField('User ID', user.id)
        .addField('Avatar URL', user.displaydisplayAvatarURL)
        .setThumbnail(user.displaydisplayAvatarURL)
        .setColor('#00aaff')
        .setTimestamp()
        .setFooter(client.user.tag, client.user.displaydisplayAvatarURL)
    try {
        embed.addField('Status', user.presence.status)
        if (user.presence.game) {
            embed
                .addField('Playing', user.presence.game.name)
                .addField('Is streaming', user.presence.game.streaming)
                .addField('Stream URL', user.presence.game.url)
        }
    } catch (error) { }
    if (user.bot == false) {
        if (user.presence.status != 'offline') {
            if (user.presence.status == user.presence.clientStatus.desktop) embed.addField('Using Discord On', 'Desktop')
            if (user.presence.status == user.presence.clientStatus.web) embed.addField('Using Discord On', 'Web')
            if (user.presence.status == user.presence.clientStatus.mobile) embed.addField('Using Discord On', 'Mobile')
        }
    }
    receivedMessage.channel.send(embed)
}
async function nekosLifeCommand(arguments, receivedMessage) {
    receivedMessage.channel.startTyping()
    let api = 'https://nekos.life/api/v2/img/'
    const SFWImages = ["smug", "baka", "tickle", "slap", "poke", 'pat', 'neko', 'nekoGif', 'meow', 'lizard', 'kiss', 'hug', 'foxGirl', 'feed', 'cuddle']
    const NSFWImages = ["lewdkemo", "lewdk", "keta", "hololewd", "holoero", "hentai", "futanari", "femdom", "feetg", "erofeet", "feet", "ero", "erok", "erokemo", "eron", "eroyuri", "cum_jpg", "blowjob", "pussy"]
    let i = null
    let sfw = true
    SFWImages.forEach(option => {
        if (option != arguments[0]) {
        } else {
            i = arguments[0]
        }
    })
    NSFWImages.forEach(option => {
        if (option != arguments[0]) {
        } else {
            i = arguments[0]
            sfw = false
        }
    })
    if (i !== null && sfw) {
        const file = await fetch(api + i).then(response => response.json())
        try {
            if (typeof file.msg != 'undefined') {
                let error = new Error(file.msg)
                error.name = 'nekos.lifeAPIError'
                throw error
            }
        } catch (error) {
            sendError(error, receivedMessage)
                .then(() => receivedMessage.channel.stopTyping())
        }
        receivedMessage.channel.send(new Attachment(file.url))
            .then(() => receivedMessage.channel.stopTyping())
        return
    }
    if (i !== null && !sfw) {
        if (receivedMessage.channel.nsfw == false || receivedMessage.channel.type == 'dm') {
            receivedMessage.channel.send('Please use NSFW arguments in NSFW channel only.')
                .then(() => receivedMessage.channel.stopTyping())
            return
        }
        const file = await fetch(api + i).then(response => response.json())
        try {
            if (typeof file.msg != 'undefined') {
                let error = new Error(file.msg)
                error.name = 'nekos.lifeAPIError'
                throw error
            }
        } catch (error) {
            sendError(error, receivedMessage)
                .then(() => receivedMessage.channel.stopTyping())
        }
        receivedMessage.channel.send(new Attachment(file.url))
            .then(() => receivedMessage.channel.stopTyping())
        return
    }
    if (i == null) {
        receivedMessage.channel.send('Invalid arguments,available arguments:')
        receivedMessage.channel.send('SFW:\n`' + SFWImages.join('` `') + '`' + '\nNSFW:\n`' + NSFWImages.join('` `') + '`')
            .then(() => receivedMessage.channel.stopTyping())
    }
}
function nowPlaying(receivedMessage, serverQueue) {
    if (typeof serverQueue != 'undefined') {
        if (typeof serverQueue.songs != 'undefined') {
            receivedMessage.channel.send(`\`\`\`json\n${JSON.stringify(serverQueue.songs[0], null, 2)}\`\`\``)
        }
    } else {
        receivedMessage.channel.send('There is nothing playing')
    }
}
function queueCommand(receivedMessage, serverQueue, arguments) {
    if (!arguments[0]) {
        if (typeof serverQueue != 'undefined') {
            if (typeof serverQueue.songs != 'undefined') {
                receivedMessage.channel.send(`\`\`\`json\n${JSON.stringify(serverQueue.songs, null, 2)}\`\`\``)
            }
        } else {
            receivedMessage.channel.send('There is nothing in the queue')
        }
    } else {
        if (typeof serverQueue != 'undefined') {
            if (typeof serverQueue.songs != 'undefined') {
                if (!Number(arguments[0]) == NaN) return receivedMessage.channel.send('Argument is not a number.')
                if (Math.round(arguments[0]) != arguments[0]) return receivedMessage.channel.send('Arguments is not a integer.')
                let i = arguments[0] - 1
                if (i > serverQueue.songs.length || i < 0) return receivedMessage.channel.send("Out of range.")
                receivedMessage.channel.send(`\`\`\`json\n${JSON.stringify(serverQueue.songs[i], null, 2)}\`\`\``)
            }
        } else {
            receivedMessage.channel.send('There is nothing in the queue')
        }
    }

}
async function execute(message, serverQueue) {
    const args = message.content.split(' ');

    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('I need the permissions to join and speak in your voice channel!');
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url,
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
            message.channel.send('Playing ' + song.title)
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }

}
function skip(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
    if (!serverQueue) return message.channel.send('There is no song that I could skip!');
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.channel.send('Music Ended.')
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', () => {
            console.log('Music ended!');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}