const Keyv = require("keyv");
const globalLogHooks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
const { WebhookClient, RichEmbed } = require("discord.js");
module.exports = {
  name: "messageUpdate",
  logged: "when a message's content changes",
  execute: async (oldMessage, message) => {
    if (message.system) return;
    if (oldMessage.content === message.content) return;
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!(await globalLogHooks.get(message.channel.guild.id))) return;
    const hookData = (await globalLogHooks.get(message.guild.id)).messageUpdate;
    if (!hookData) return;
    const hook = new WebhookClient(hookData.id, hookData.token);
    let oldM = oldMessage.content;
    if (oldM.length > 1024) oldM = oldM.substring(0, 1019) + "...";
    if(!oldM) oldM = "(none)"
    let newM = message.content;
    if (!newM) newM = "(none)"
    if (newM.length > 1024) newM = newM.substring(0, 1019) + "...";
    const embed = new RichEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL)
      .setTitle("Message edit")
      .setColor("#ffd105")
      .setURL(message.url)
      .addField("Message author", message.author.tag)
      .addField("Before", oldM)
      .addField("After", newM)
      .setTimestamp()
      .setFooter(message.client.user.tag, message.client.displayAvatarURL);
    hook.send(embed).catch(async error => {
      if (error.code === 10015) {
        const data = delete (await globalLogHooks.get(message.guild.id))
          .message;
        globalLogHooks.set(message.guild.id, data);
      } else throw error;
    });
  }
};
