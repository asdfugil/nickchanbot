"use strict";
require("dotenv").config();
console.log("Starting...");
const Discord = require("discord.js");
const fs = require("fs");
const { BOT_TOKEN, PREFIX, DEVS_ID,BOT_PORT } = process.env;
const serialize = require("serialize-javascript");
const t = require('./custom_modules/translate')
const { deserialize } = require("./custom_modules/ncbutil.js");
const fetch = require('node-fetch')
const prefix = PREFIX;
const { Collection } = Discord;
const rankSettings = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "rank-settings"
})
Discord.Guild.prototype.language = 'zh_Hant'
Discord.Guild.prototype["xpCooldowns"] = new Collection();
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
  }
}
const client = new NickChanBotClient();
const Keyv = require("keyv");
const prefixs = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "prefixs"
});
const ranks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "ranks"
});
const snipe = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "snipe"
});
const parseTag = require("./custom_modules/parse-tag-vars.js");
const tags = new Keyv("sqlite://.data/database.sqlite", { namespace: "tags" });
const check = require("./custom_modules/check.js");
const moduleDirs = fs
  .readdirSync("./commands",{ withFileTypes:true })
  .filter(x => x.isDirectory)
  .filter(x => x.name !== 'index.js')
  .map(x => x.name)
const processRank = require("./custom_modules/ranks.js");
const mutedutil = require("./custom_modules/muted.js");
for (let moduleName of moduleDirs) {
    const module_ = require(`./commands/${moduleName}`)
    module_.commands = new Collection()
    const commandFiles = fs.readdirSync(`./commands/${moduleName}`)
    .filter(file => file.endsWith(".js"))
    for (const commandName of commandFiles) {
      try {
      const command = require(`./commands/${moduleName}/${commandName}`)
      module_.commands.set(command.name,command)
      client.commands.set(command.name,command)
      } catch(error) {
        console.log(error)
      }
    }
  client.modules.set(module_.id,module_)
}
/*
for (const file of loggerFiles) {
  try {
    const logger = require(`./loggers/${file}`);
    client.loggers.set(logger.name, logger);
    console.log(`Loaded '${logger.name}' logger.`);
  } catch (error) {
    console.error(`Unable to load ${file}, reason:\n${error.stack}`);
  }
}
*/
require("./custom_modules/loggers.js")(client);
const cooldowns = new Collection();
client.once("ready", async () => {
  console.log("Ready!");
  mutedutil.mutedTimers(client);
  mutedutil.updateMutedRoles(client);
  mutedutil.autoReMute(client);
  mutedutil.autoUpdateDataBase(client);
  client.owner = await client.users.fetch(process.env.OWNERID);
  client.developers = [];
  DEVS_ID.split(",").forEach(dev =>
    client.users.fetch(dev).then(user => client.developers.push(user))
  );
  client.guilds.cache.forEach(async guild => {
    const res = await fetch(`http://localhost:3000/api/v1/guilds/${guild.id}/language`,{
      method:"GET",
      headers:{
          authorization:process.env.API_KEY
      }})
      if (!res.ok) return
      guild.language = await res.json()
  })
  require('express')().get('/',(req,res) => res.send('ok')).listen(BOT_PORT)
});
client.on("lvlup",
  /**
  * @param { Message } message - The message the make the member level
  * @param { number } o - Old level
  * @param { number } n - new level
  */
  async (message, o, n) => {
    const { member } = message
    if (!member.guild.me.hasPermission("MANAGE_ROLES")) return
    const { rewards } = await rankSettings.get(message.guild.id) || Object.create(null)
    if (!rewards) return
    const role_id = rewards[n.toString()]
    if (!role_id) return
    const role = message.guild.roles.get(role_id)
    if (!role) return
    if (message.guild.me.highestRole.comparePositionTo(role) <= 0) return
    message.member.addRole(role, "Level rewards")
  }
)
client.on("ready", () => {
  check(client);
  client.user.setActivity(`Use @${client.user.username} to get started!`);
});
ranks.on("error", console.error);
client.on("messageDelete",message => {
  snipe.set(message.channel.id,{
    content:message.content,
    author:{
      tag:message.author.tag,
      displayAvatarURL:message.author.displayAvatarURL
    },createdTimestamp:message.createdTimestamp
  })
})
async function processTag(commandName, message, args) {
  if (message.guild) {
    const guildTags = await tags.get(message.guild.id) || Object.create(null)
    const triggered = guildTags[commandName]; 
    if (triggered) {
      await message.channel.startTyping();
      try {
        const msg = await parseTag(message, triggered, args);
        await message.channel.send(msg, { split: true });
      } catch (error) {
        message.reply("Tag Error\n```" + error + "```");
      }
      message.channel.stopTyping();
      triggered.count++;
      tags.set(message.guild.id, guildTags);
    }
  }
}
client.on("message", async message => {
  let actualPrefix = prefix;
  if (message.guild) {
    if (await prefixs.get(message.guild.id))
      actualPrefix = await prefixs.get(message.guild.id);
  }
  if (
    [`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(message.content)
  )
    message.channel.send(
      `Hi! My prefix is \`${actualPrefix}\`\nTo get started type \`${actualPrefix}help\``
    );
  processRank(message, ranks);
  if (!message.content.startsWith(actualPrefix) || message.author.bot) return;
  const args = message.content
    .slice(actualPrefix.length)
    .split(' ');
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)) ||
    client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName));
  processTag(commandName, message, args);
  if (!command) return;
  console.log(`Command received from ${message.author.tag}
command name:${commandName}
arguments:${args}`);
  if (command.guildOnly && message.channel.type !== "text")
    return message.reply("I can't execute that command inside DMs!");

  if (command.nsfw && !message.channel.nsfw)
    return message.reply("NSFW commands can only be used in NSFW channels.");
  if (command.args > args.length) {
    let reply = `You didn't provide enough arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${actualPrefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    await command.execute(message, args).catch(error => {
      console.error(error);
      if (!error.code)
        message.reply("there was an error trying to execute that command!");
      else
        message.reply(
          `there was an error trying to execute that command! (${error.code})`
        );
    });
  } catch (error) {
    console.error(error);
    if (!error.code)
      message.reply("there was an error trying to execute that command!");
    else
      message.reply(
        `there was an error trying to execute that command! (${error.code})`
      );
  }
});
client.login(BOT_TOKEN);
