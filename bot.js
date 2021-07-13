"use strict";
require("dotenv").config();
console.log("Starting...");
const Discord = require("discord.js");
const fs = require("fs");
const { BOT_TOKEN, PREFIX, DEVS_ID, BOT_PORT } = process.env;
const { noBotPermission, noPermission, Tag, findMember, findRole } = require('./modules')
const t = require('./modules/translate')
const fetch = require('node-fetch')
const prefix = PREFIX;
const { Collection, Permissions } = Discord;
Discord.Guild.prototype.language = 'en'
Discord.Guild.prototype["xpCooldowns"] = new Array();
const { language, tags, snipe, mute_info,prefixes } = require('./sequelize')
const tag_parser = require("./modules/parse-tag-vars")
class NickChanBotClient extends Discord.Client {
  constructor(clientOptions) {
    super(clientOptions);
    this.commands = new Collection();
    this.loggers = new Collection();
    this.changelogs = fs.readFileSync("./documents/changelogs.txt", "utf8");
    this.queue = new Collection();
    this.owner = undefined;
    this.developers = [];
    this.modules = new Collection()
    this.cooldowns = new Collection()
    this.fetchGiftCode = function (code) {
      code = args.join(' ')
        .replace('https://discord.gift/')
        .replace('http://discord.gift/')
        .replace('https://discord.com/gifts/')
        .replace('http://discord.com/gifts/')
        .replace('http://canary.discord.com/gifts/')
        .replace('https://canary.discord.com/gifts/')
      //@ts-ignore
      return message.client.api.entitlements['gift-codes'].get(code)
    }
  }
}
const client = new NickChanBotClient({
  ws: { intents: 32767 },
  partials: ['USER', 'CHANNEL', 'REACTION', 'MESSAGE', 'GUILD_MEMBER'],
  http: {
    version: 7,
    api: 'https://discord.com/api'
  },
  disableMentions: 'everyone',
  retryLimit:9999
});
const moduleDirs = fs
  .readdirSync("./commands", { withFileTypes: true })
  .filter(x => x.isDirectory)
  .filter(x => x.name !== 'index.js')
  .map(x => x.name)
for (let moduleName of moduleDirs) {
  const module_ = require(`./commands/${moduleName}`)
  module_.commands = new Collection()
  const commandFiles = fs.readdirSync(`./commands/${moduleName}`)
    .filter(file => file.endsWith(".js"))
  for (const commandName of commandFiles) {
    try {
      const command = require(`./commands/${moduleName}/${commandName}`)
      command.module = module_
      module_.commands.set(command.name, command)
      client.commands.set(command.name, command)
      if (command.module.id !== 'nsfw' && command.nsfw && !command.supressNSFWwarning) console.error(`WARNING: Command "${command.name}" is NSFW but not in nsfw module!`)
      if (command.module.id === 'nsfw' && !command.nsfw && !command.supressNSFWwarning) console.error(`WARNING: Command "${command.name}" is not NSFW but in nsfw module!`)
      //client.cooldowns.set(command.name, new Collection());
      //console.debug(`Loaded command "${command.name}".`)
    } catch (error) {
      console.error(error)
    }
  }
  client.modules.set(module_.id, module_)
}
process.on("uncaughtException",(error) => {
  console.error(error)
  client.destroy()
  process.exit(9)
})
process.on("unhandledRejection",(error) => console.error(error))
client.on('guildMemberAdd', async member => {
  const muteInfo = (await mute_info.findOne({ where: { guild_id: member.guild.id } }))?.dataValues || { mutes: {} }
  if (!muteInfo) return
  if (Object.prototype.hasOwnProperty.call(muteInfo.mutes, member.id) && (muteInfo.mutes[member.id] > (Date.now() - 100) || !muteInfo[member.id])) {
    const role = member.guild.roles.resolve(muteInfo.muted_role)
    if (!role) return;
    if (member.guild.me.hasPermission('MANAGE_ROLES') && role.position < member.guild.me.roles.highest.position) member.roles.add(role, 'Automatic re-mute')
  }
})
client.on('channelCreate', async channel => {
  try {
    if (!channel.guild) return;
    const muteInfo = (await mute_info.findOne({
      where: { guild_id: channel.guild.id }
    }))?.dataValues
      || { mutes: {} }
    const role = channel.guild.roles.resolve(muteInfo.muted_role)
    if (!role) return;
    if (channel.guild.me.hasPermission('MANAGE_ROLES') && role.position < channel.guild.me.roles.highest.position) channel.createOverwrite(role, { SEND_MESSAGES: false, SPEAK: false }, 'Muted role')
  } catch (error) { console.error(error) }
})
client.once("ready", async () => {
  console.log("Ready!");
  mute_info.findAll()
    .then(allMuteInfoModels => {
      for (const muteInfoModel of allMuteInfoModels) {
        const { mutes, guild_id, muted_role } = muteInfoModel?.dataValues || { mutes: {} }
        const guild = client.guilds.resolve(guild_id)
        if (!guild) return
        const role = findRole(guild, muted_role)
        if (!role) return
        for (const [memberID, expiresAt] of Object.entries(mutes)) {
          if (!expiresAt) return
          findMember(guild, memberID)
            .then(member => {
              if ((expiresAt - Date.now()) <= 100) {
                if (!member) return
                member.roles.remove(role, 'Automatic un-mute')
                delete mutes[member.id]
                mute_info.upsert({ mutes, guild_id, muted_role })
              } else {
                setTimeout(async () => {
                  const newInfo = (await mute_info.findOne({ where: { guild_id: member.guild.id } }))?.dataValues
                    || { guild_id: member.guild.id, mutes: {} }
                  if (member.deleted) {
                    delete newInfo.mutes[member.id]
                    return mute_info.upsert(newInfo)
                  }
                  if (member.guild.deleted || role.deleted
                    || role.posiiton >= member.guild.me.roles.highest.position || !member.guild.me.hasPermission('MANAGE_ROLES')) return
                  await member.roles.remove(role, 'Automatic un-mute')
                  delete newInfo.mutes[member.id]
                  mute_info.upsert(newInfo)
                }, expiresAt - Date.now())
              }
            }).catch(
              /**
               * @param { import("discord.js").APIErrror | Error } _
               */
              _ => {
                if (_.message !== 'Unknown Member') throw _
              })
        }
      }
    }).catch(console.error)

  client.owner = await client.users.fetch(process.env.OWNERID);
  client.developers = [];
  DEVS_ID.split(",").forEach(dev =>
    client.users.fetch(dev).then(user => client.developers.push(user))
  );
  client.guilds.cache.forEach(async guild => {
    const value = (await language.findOne({ where: { id: guild.id } }))?.dataValues || {}
    guild.language = value ? value.language : 'en'
  })
  if (!fs.readdirSync(require('os').tmpdir()).includes(client.user.tag)) {
    fs.mkdirSync(require('os').tmpdir() + `/${client.user.tag}`)
  }
})
client.on("ready", async () => {
  client.user.setPresence({
    activity: {
      name: `Use @${client.user.username} to get started!`,
      application: { id: '612829569199767574' }
    }
  });
});
client.on("messageDelete", async message => {
  try {
    if (message.partial) return
    const base64 = ''/* await Promise.all(
    message.attachments.map(attachment => {
      return new Promise(async (resolve, reject) => {
        const chunks = []
        const response = await fetch(attachment.proxyURL || attachment.url, { headers: { 'user-agent': process.env.USER_AGENT } })
        response.body.on('data', chunk => chunks.push(chunk))
        response.body.on('close', () => resolve(Buffer.concat(chunks)))
      })
    })).then(buffers => buffers.map(buffer => buffer.toString('base64')))
  */
    snipe.upsert({
      content: message.content,
      created_at: message.createdAt,
      author_tag: message.author.tag,
      author_avatar_url: message.author.displayAvatarURL({ dynamic: true, size: 256 }),
      channel_id: message.channel.id,
      is_dm: message.channel.type === 'dm',
      //  attachments: base64.join(',')
    }).catch(console.error)
  } catch (error) {
    console.error(error)
  }
})
const processTag = (async (message, args, prefix) => {
  if (!message.guild) return
  const guildTags = (await tags.findOne({ where: { guild_id: message.guild.id } }))?.dataValues?.tags || {}
  const tag = guildTags[message.content.split(" ")[0].substr(prefix.length).toLowerCase()]
  if (!tag) return
  const TAG = new Tag(message.content.split(" ")[0].substr(prefix.length).toLowerCase(), tag, false, "", 0)
  try {
    const result = tag_parser(message, TAG, args)
    message.channel.send(result || "Tag returned nothing")
  } catch (error) {
    message.reply("tag error.\n```\n" + error.toString() + "\n```")
  }
})
client.on("message", async message => {
  let actualPrefix = prefix;
  require('./modules/ranks')(message)
  if (message.guild) {
    //Read message (history),send message
    if (!message.guild.me.permissions.has(68608)) return
    actualPrefix = (await prefixes.findOne({ where: { guild_id: message.guild.id }}) || undefined)?.dataValues.prefix || prefix
  } else { if (message.channel.partial) message.channel = await message.channel.fetch() }
  if ([`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(message.content))
    message.channel.send(`Hi! My prefix is \`${actualPrefix}\`\nTo get started type \`${actualPrefix}help\``);
  if (!message.content.startsWith(actualPrefix) || message.author.bot) return;
  const args = message.content
    .slice(actualPrefix.length)
    .split(' ');
  processTag(message, args, actualPrefix)
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)) ||
    client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName));
  if (!command) return;
  console.log(`Command received from ${message.author.tag}
command name:${commandName}
arguments:${args}`);
  if ((command.devsOnly || command.module.id === 'devs-only') && !DEVS_ID.split(',').includes(message.author.id)) return message.channel.send(t('util.you_cannot_use_this_command', client, message.guild))
  if (command.guildOnly && message.channel.type !== "text")
    return message.reply("I can't execute that command inside DMs!");
  if (command.userPermissions && message.guild) {
    const text_perms = new Permissions(command.userPermissions)
    const normal_permissions = new Permissions(command.userPermissions)
    //strip non-text permissions
    text_perms.remove(2146436543)
    //strip channel permissions
    normal_permissions.remove(66583872)
    if (!message.channel.permissionsFor(message.member).has(text_perms.bitfield) || !message.member.permissions.has(normal_permissions.bitfield)) {
      const perms_required = new Permissions(command.userPermissions)
      const required_array = []
      for (const [key, value] of Object.entries(perms_required.serialize())) { if (value) required_array.push(key) }
      return noPermission(required_array.map(item => `\`${t(`permissions.${item}`, client, message.guild)}\``).join(','), message.channel)
    }
  }
  if (command.clientPermissions && message.guild) {
    const text_perms = new Permissions(command.clientPermissions)
    const normal_permissions = text_perms
    const voice_permissions = text_perms
    if (text_perms.any(268443710) && message.guild.mfaLevel && !client.user.mfaEnabled) return message.reply('Please disable server 2FA and try again.')
    //strip non-text permissions
    text_perms.remove(2146436543)
    //strip channel permissions
    normal_permissions.remove(66583872)
    voice_permissions.remove(2080898303)
    const voice_channel = command.voiceChannel ? command.voiceChannel(message, args) : message.member.voice.channel;
    if (voice_permissions.bitfield && !voice_channel) message.reply('Command requires voice permissions but voice_channel is undefined or null.\nPlease join a voice channel and try again.')
    if (!message.channel.permissionsFor(message.guild.me).has(text_perms.bitfield) || !message.channel.permissionsFor(message.guild.me).has(voice_permissions) || !message.guild.me.permissions.has(normal_permissions.bitfield)) {
      const perms_required = new Permissions(command.clientPermissions)
      const required_array = []
      for (const [key, value] of Object.entries(perms_required.serialize())) { if (value) required_array.push(key) }
      return noBotPermission(required_array.map(item => `\`${t(`permissions.${item}`, client, message.guild)}\``).join(','), message.channel)
    }
  }
  if (command.nsfw && !message.channel.nsfw)
    return message.reply("NSFW commands can only be used in NSFW channels.");
  if (command.args > args.length) {
    let reply = `You didn't provide enough arguments, ${message.author}!`;
    if (command.usage) reply += `\nThe proper usage would be: \`${actualPrefix}${command.name} ${command.usage[message.guild.language] || command.usage.en}\``;
    return message.channel.send(reply);
  }
  if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection());
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  try {
    await command.execute(message, args)
  } catch (error) {
    console.error(error);
    if (!error.code) message.reply("There was an error trying to execute that command!\n```prolog\n" + error.toString() + '```');
  }
});
client.login(BOT_TOKEN);
