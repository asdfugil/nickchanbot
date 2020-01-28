const Keyv = require("keyv");
const globalLogHooks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
const { WebhookClient, RichEmbed } = require("discord.js");
module.exports = {
  name: "message",
  logged: "Logged when a user (bots not included).",
  execute: async message => {
    if (message.system) return
    if (!message.guild) return;
    if (message.author.bot) return
      if (!await globalLogHooks.get(message.channel.guild.id)) return
    const hookData = (await globalLogHooks.get(message.guild.id)).message;
    if (!hookData) return
    const hook = new WebhookClient(hookData.id, hookData.token);
    const embed = new RichEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL)
      .setColor("#34aeeb")
      .setTitle("Message log")
      .setURL(message.url)
      .setDescription(message.content)
      .addField("Channel",message.channel.toString())
      .addField("Chanel ID",message.channel.id)
      .addField("Message ID",message.id)
      .setTimestamp(message.createdTimestamp)
      .setFooter(message.client.user.tag, message.client.user.displayAvatarURL);
    if (message.attachments.first()) {
      const content = message.attachments.map(x => `${x.id} : [link](${x.url})`).join('\n')
      embed.addField('Attachment(s) (ID: link)',content)
    }
    hook.send(embed).catch(console.error);
  }
};
