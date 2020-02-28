const {
  noPermission,
  noBotPermission,
  findRole
} = require("../custom_modules/ncbutil.js");
const Keyv = require("keyv");
const { Collection, WebhookClient, RichEmbed } = require("discord.js");
const globalLogHooks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
const fs = require("fs");
const loggerFiles = fs.readdirSync("./loggers/");
const loggers = new Collection();
const { setMutedRole } = require("../custom_modules/muted.js")
for (const file of loggerFiles) {
  try {
    const logger = require(`../loggers/${file}`);
    loggers.set(logger.name, logger);
  } catch (error) { }
}
const mutedRoles = new (require("keyv"))("sqlite://.data/database.sqlite", { namespace: "muted-roles" })
const rankSettings = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "rank-settings"
})
module.exports = {
  name: "config",
  description: "Do some configuration.",
  guildOnly: true,
  cooldown: 3,
  args: 1,
  usage: "<config category> <config item> <new value>",
  info:
    "Type `none` into <new value> to remove it.\nUse `config view` to view the configuration\nConfig category:`log-channels`" +
    `
${loggers.map(x => `\`${x.name}\` Logged when ${x.logged}`).join("\n")}` +
    "\nConfig Category:`moderation`\n`muted-role` set the muted role" + 
    "\nConfig Category:`rank_rewards` set rank role rewards"+ 
    "\n`1` Role fo level 1\n`2` Role for level 2...\n`n` Role for level n",
  execute: async (message, args) => {
    if (!message.member.hasPermission("MANAGE_GUILD"))
      return noPermission("Manage server", message.channel);
    const { client } = message;
    if (args[0] === "view") {
      const data = await globalLogHooks.get(message.guild.id);
      if (!data)
        return message.reply(
          "There are no set configurations for this server."
        );
      const man = new Collection();
      for (const key of Object.keys(data)) {
        try {
          const hooks = await message.guild.fetchWebhooks();
          const hook = hooks.get(data[key].id);
          if (!hook) throw new Error();
          man.set(key, `<#${hook.channelID}>`);
        } catch (error) {
          delete data[key];
          globalLogHooks.set(message.guild.id, data);
        }
      }
      const configs = man.map((V, K) => `${K} => ${V}`).join("\n");
      const embed = new RichEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL)
        .setColor("#34aeeb")
        .setTitle("Configurations")
        .addField("Log Channels", configs)
        .setFooter(
          `Requested by ${message.author.tag}`,
          message.author.displayAvatarURL
        );
      if (await mutedRoles.get(message.guild.id)) embed.addField("Moderation", `Muted Role => <@&${await mutedRoles.get(message.guild.id)}>`)
      message.channel.send(embed);
      return;
    } else if (args[0] === "log-channels") {
      if (!client.loggers.has(args[1]))
        return message.reply("Invalid logger name given.");
      let channel;
      if (args[2] !== "none") {
        channel = message.mentions.channels.first();
        if (!channel) return message.reply("No channel mention is given.");
        if (
          !channel.permissionsFor(message.guild.me).serialize().MANAGE_WEBHOOKS
        )
          noBotPermission("manage webhooks");
        const webhooks = await channel.fetchWebhooks();
        let hook = webhooks.find(x => x.name === client.user.username.substring(0, 23) + " Logging");
        let data = await globalLogHooks.get(channel.guild.id);
        if (!data) data = {};
        if (!hook)
          hook = await channel.createWebhook(
            client.user.username.substring(0, 23) + " Logging",
            client.user.displayAvatarURL
          );
        data[args[1]] = {};
        data[args[1]].id = hook.id;
        data[args[1]].token = hook.token;
        await globalLogHooks.set(channel.guild.id, data);
        message.channel.send(
          `The \`${
          args[1]
          }\` logger will start logging in ${channel.toString()}`
        );
      } else {
        let data = await globalLogHooks.get(message.guild.id);
        if (!data) {
          data = {};
          return message.reply(
            "You cannot remove configs that is not set previously."
          );
        }
        if (!data[args[1]])
          return message.reply(
            "You cannot remove configs that is not set previously."
          );
        else {
          delete data[args[1]];
          await globalLogHooks.set(message.channel.guild.id, data);
        }
      }
    } else if (args[0] === "moderation") {
      if (args[1] === "muted-role") {
        if (args[2] === "none") {
          await mutedRoles.delete(message.guild.id)
          return message.channel.send("Reomve the muted role configuration successfully.")
        }
        const role = findRole(message, args.slice(2).join(" "))
        if (!role) return message.reply("Unknown role")
        await mutedRoles.set(message.guild.id, role.id)
        const embed = new RichEmbed()
          .setColor("#00ff00")
          .setDescription(`The ${role.toString()} role will be used for the mute command.`)
        message.channel.send(embed)
        setMutedRole(role)
      } else message.reply("Unknown config item.")
    } else if (args[0] === "rank_rewards") {
      const role = findRole(message,args.slice(2).join(" "))
      if (!role) return message.reply("That is not a valid role.")
      const level = args[1]
    }
    else message.reply("Invaild config category given.");
  }
};
