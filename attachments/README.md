# NICK CHAN # 5213 [BOT]

## About

Nick Chan#5213 [BOT] (Nick Chan Bot) is a private Discord bot written by Nick Chan#0001 (Owner) using the discord.js library ([website](https://discord.js.org)) .

**User ID**: 610070268198780947

**Tag**: Nick Chan#5213

**Prefix** : /



## Commands

Note: arguments in `()` is optional

### Help

Description :Get help about the bot

Usage: `help [command]`

### Spam

Description: Spam a specified number of messages

Usage : `Spam <count>`

Note: `<count>` cannot be higher than 50000

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

## Support

[Support server link](https://discord.gg/kPMK3K5)

