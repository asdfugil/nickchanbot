const prefix = process.env.PREFIX
const { Message,Permissions } = require('discord.js')
/**
 * 
 * @param { Message } message 
 */
module.exports = async message => {
  let actualPrefix = prefix;
  if (message.guild) {
    //Read message (history),send message
    if (!message.guild.me.permissions.has(68608)) return
    if (await prefixs.get(message.guild.id)) actualPrefix = await prefixs.get(message.guild.id);
  } else { if (message.channel.partial) message.channel = await message.channel.fetch() }
  if ([`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(message.content))
    message.channel.send(`Hi! My prefix is \`${actualPrefix}\`\nTo get started type \`${actualPrefix}help\``);
  if (!message.content.startsWith(actualPrefix) || message.author.bot) return;
  const args = message.content
    .slice(actualPrefix.length)
    .split(' ');
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
    const voice_channel = command.voiceChannel ? command.voiceChannel() : message.member.voice.channel;
    if (voice_permissions.bitfield && !voice_channel) message.reply('Command requires voice permissions but voice_channel is undefined or null.\nPlease join a voice channel and try again.')
    if (!message.channel.permissionsFor(message.guild.me).has(text_perms.bitfield) || !message.channel.permissionsFor(message.guild.me).has(voice_permissions)|| !message.guild.me.permissions.has(normal_permissions.bitfield)) {
      const perms_required = new Permissions(command.clientPermissions)
      const required_array = []
      for (const [key, value] of Object.entries(perms_required.serialize())) { if (value) required_array.push(key) }
      console.log(required_array)
      return noBotPermission(required_array.map(item => `\`${t(`permissions.${item}`, client, message.guild)}\``).join(','), message.channel)
    }
  }
  if (command.nsfw && !message.channel.nsfw)
    return message.reply("NSFW commands can only be used in NSFW channels.");
  if (command.args > args.length) {
    let reply = `You didn't provide enough arguments, ${message.author}!`;
    if (command.usage) reply += `\nThe proper usage would be: \`${actualPrefix}${command.name} ${command.usage}\``;
    return message.channel.send(reply);
  }
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }
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
    if (!error.code) message.reply("There was an error trying to execute that command!\n```prolog\n"+error.toString()+'```');
  }
}