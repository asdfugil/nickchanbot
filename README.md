<div align="center">
    <img src="https://i.imgur.com/YLjMTON.png"><br><br>

---

# NICK CHAN # 5213 [BOT]
</div>

## About

Nick Chan#5213 [BOT] (Nick Chan Bot) is a private Discord bot written by Nick Chan#0001 (Owner) using the discord.js library ([website](https://discord.js.org)) .

**User ID**: 610070268198780947

**Tag**: Nick Chan#5213

**Prefix** : /

## Support

[Support server link](https://discord.gg/kPMK3K5)


## Commands

Note: arguments in `()` is optional

### Help

Description :Get help about the bot

Usage: `help [command]`

### Spam

Description: Spam a specified number of messages

Usage : `Spam <count>`

Note: `<count>` cannot be higher than 50000

### embed-spam

Description: Spam a specified number of embeds

Usage : `embed-spam <count>`

Note: `<count>` cannot be higher than 300

### Multiply

Description : Multiply two or more numbers together

Usage: `multiply <number> <number> [number]...`

### Changelogs

Description : latest change logs of the bot

Usage: `changelogs`

### Spam-ping

Description: Spam ping everyone a specified number of messages

Usage : `Spam-ping <count>`

Note:` <count>` cannot be higher than 50000

### Kick

Description: Kicks a member

Usage: `kick <mention> [reason]`

Note: Does not support reasoning for now. The reason will be `Requested by [command invoker]`

### About

Description : Sends this file in chat

Usage : `About`

### Ping

Description : returns latency

Usage : `Ping`

### Ban

Description: bans a member

Usage: `ban <mention> [reason]`

### Unban

Description: unbans a member

Usage: `unban <UserID> [reason]`

### Purge 

Description: Bulk delete messages

Usage : `purge <count>`

### 8ball

Description: Ask 8ball a question

Usage:`8ball [question]`

### Dog/Cat

Description: return an image of a dog/cat

Usage `dog`/ `cat`

### Say

Description :Use the bot to say something

Usage: `say <message>`

### Randomstring

Description: return an random string.

Usage: `randomstring <length>`

Note: The characters can be: 

`A-Z` ,`a-z` ,`0-9` and `_`

### Randomelement

Description: returns an random element

Usage: `randomelement`

### Logs

Description: returns bot runtime log

Usage: `logs`

### Server-info

Description: returns server info

Usage: `server-info [detailed|json]`

### googlesearch

Description: google something

Usage:`googlesearch <query>`

### Eval

Description: Evaluates the arguments

Usage: `eval <code>`

Note: Bot owner only

Execution environment : 

```JavaScript
const Discord = require('discord.js')
const fs = require('fs')
const moment = require(`moment`)
const googleIt = require('google-it');
const config = require('./config.json')
const client = new Discord.Client()
const avatar = new Discord.Attachment('./attachments/Avatar.png')
var talkChannelOn = false
var talkChannel = 'off'
try {
client.on('message', (receivedMessage) => {
    var serverSettings = JSON.parse(fs.readFileSync('./data/'+receivedMessage.guild.id+'.json','utf8'))
    try {
    eval('<code> //code goes into here')
    } catch(error) {
        receivedMessage.channel.send(`An Error occured.. \n\n \`${error.name}:${error.message}\``)
        console.log('Error while executing eval command: \n' + error))
    }
})
client.login(config.token)
```

### Reconnect

Description: Make the bot log out,then log in .

Usage: `reconnect`

Note: Bot owner only

### Set-talk-channel

Description: none

### play

Description: plays music

Usage: `play <youtube url>`

### skip

Description: skips the current song

usage: `skip`

### stop

Description: ends all music 

Usage: `stop`

### now-playing

Description: shows the currently playing song

Usage: `now-playing`

### queue

Description: Shows the server queue,or a song with a specific position in queue

Usage : `queue [position]`

### nekos-life

Description : fetch a image form nekos.life

Usage: `nekos-life <argument>`

Available arguments:

SFW: `smug` `baka` `tickle` `slap` `poke` `pat` `neko` `nekoGif` `meow` `lizard` `kiss` `hug` `foxGirl` `feed` `cuddle` 

NSFW: `lewdkemo` `lewdk` `keta` `hololewd` `holoero` `hentai` `futanari` `femdom` `feetg` `erofeet` `feet` `ero` `erok` `erokemo` `eron` `eroyuri` `cum_jpg` `blowjob` `pussy` 

### config

Description:Change server settings

Usage `config <config category> <config item> <new value>`

**__Category:`log-channels`__** Sets the log channels
In this category `<new value>` must be a channel mention. 
List of `<config item>`s
`startTyping` Logged when someone starts typing
`stopTyping` Logged when someone stops typing
`message` Logged when someone sends a message
`messageDelete` Logged when someone deletes a message
`messageDeleteBulk` Logged when someone bulk delete messages
`messageUpdate` Logged when a message is updated
`channelCreate` Logged when a channel is created
`channelDelete` Logged when achannel is deleted
`channelUpdate` Logged when a channel is updated
`guildBanAdd` Logged when someone is banned
`guildBanRemove` Logged when someone is unbanned
`guildMemberAdd` Logged when someone joins the server
`guildMemebrRemove` Logged when someone leaves the server.
`error` Logged when the bot encouters an error wjile doing something on the server.
`emojiCreate` Logged when a emoji is craeted.
`emojiDelete`Logged when an emoji is deleted
`emojiUpdate`Logged when an emoji is updated.

### rank

Description : Shows the rank of a member

Usage : `rank [member]`

### errors

Description: Shows the bot's errors

Usage: `errors`
