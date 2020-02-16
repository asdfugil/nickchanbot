<div align="center">
    <img src="https://i.imgur.com/mAojAot.png"><br><br>
---

# NICK CHAN # 5213 [BOT]

</div>

## About

Nick Chan#5213 [BOT] (Nick Chan Bot) is a private Discord bot written by Nick Chan#0001 (Owner) using the discord.js library ([website](https://discord.js.org)) .

**User ID**: 610070268198780947

**Tag**: Nick Chan#5213

**Default Prefix** : /

## Support

[Support server link](https://discord.gg/kPMK3K5)

## Self-hosting
We don't provide self-hosting support,but if you want to:
Node.js v10 required (Must be v10,not 11 ,12 etc.)
`nano`,`git` required.

```bash
$ git clone https://26f8eb92-819c-46b8-b117-319e33f583d3@api.glitch.com/git/nickchanbot-server
$ cd nickchanbot-server
$ mv .env.example .env
$ mv .database.sqlite.example database.sqlite
$ nano .env
```
Now insert the required information,then press ^X (Ctrl + X) to exit
```bash
$ npm install
$ npm start
```
If you see `Ready!` on your screen,you are done.
## Commands

**Command count:** 64

`about` -- shows bot information

`addtag` -- add/overwrite a tag (custom commands)

`anime-byid` -- GET an anime by its anilist id

`anime-manga-character-byid` -- GET anime or manga characters by its AniList ID

`anime-manga-character` -- Search for a anime or manga character on AniList

`anime` -- Search anime on AniList.

`background` -- set the background image in the rank command

`ban` -- bans a user/member from the server

`bio` -- Displays a profile from discord.bio (globally).

`changelogs` -- Shows bot changelogs

`config` -- Do some configuration.

`setdeaf` -- Deafen a member

`delete-tag` -- deletes a tag

`disconnect` -- Make the bot leave voice chnanel

`random-element` -- retruns a random element.

`embed` -- sends a custom embed (INDEV)

`eval` -- Execute code (bot developers only)

`exec` -- Run bash or command on terminal (bot developers only)

`help` -- List all of my commands or info about a specific command.

`invite-info` -- Show information about a discord invite

`kick` -- kick members

`listTags` -- list tags(custom commands)

`loop` -- set music loop mode

`manga-byid` -- GET manga by id on AniList

`manga` -- Search manga on AniList.

`math` -- a calculator

`member-info` -- Shows information about a server member

`mute` -- mute a member

`nekos-life` -- Fetch a image from https://nekos.life

`nick` -- give yourself a new,random nickname

`nowplaying` -- Get the song that is playing.

`npm` -- search a package on npm

`parse-tag-source` -- **Documentation missing.**

`pause` -- Pauses the music

`ping` -- returns latency

`play` -- plays music

`prefix` -- Sets a new prefix

`purge` -- Mass delete messages,pinned messages will not be deleted.

`qr` -- Encodes data in a QR Code

`queue` -- shows music queue.

`randomstring` -- **Documentation missing.**

`randomping` -- Randomly pings people

`rank` -- shows you or a member's level

`reload` -- Reloads a command (bot developers only)

`remove-song` -- removes a song from queue

`resume` -- resumes the music

`say` -- Make the bot say something

`server-info` -- shows server info

`set-muted-role` -- Set the role to be used in the mute command

`skip` -- Skip a song!

`stats` -- Display bot statisics

`stop` -- Stop all songs in the queue and disconnect!

`stoptyping` -- makes the bot stops typing

`summon` -- make the bot join a voice channel

`tag-info` -- shows tag info

`unban` -- unbans a user

`unmute` -- unmute a member

`uptime-robot-page` -- Shows a link to the bot's uptime robot status page

`urban` -- Look up a word on urban dictionary.

`userinfo` -- shows user info

`vm` -- execute code in a sandbox

`voicemute` -- Voice mute a member

`volume` -- set/show volume

`xp-leaderboard` -- Shows xp leaderboard

## API

API base URL `https://nickchanbot-server/api/v0`

### GET /ranks?guild_id=${guild_id}
 
 Returns the ranks data of the specified server
