const Keyv = require("keyv");
const globalLogHooks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
const { WebhookClient, RichEmbed } = require("discord.js");
module.exports = {
  name: "message",
  logged: "a user (bots not included) sends a message.",
  execute: async message => {
    if (message.system) return;
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!(await globalLogHooks.get(message.channel.guild.id))) return;
    const hookData = (await globalLogHooks.get(message.guild.id)).message;
    if (!hookData) return;
    const hook = new WebhookClient(hookData.id, hookData.token);
    const embed = new RichEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL)
      .setColor("#34aeeb")
      .setTitle("Message log")
      .setURL(message.url)
      .setDescription(message.content)
      .addField("Channel", message.channel.toString())
      .addField("Chanel ID", message.channel.id)
      .addField("Message ID", message.id)
      .setTimestamp(message.createdTimestamp)
      .setFooter(message.client.user.tag, message.client.user.displayAvatarURL);
    if (message.attachments.first()) {
      if (message.attachments.length < 5) {
        const content = message.attachments
          .map(x => `${x.id} : [link](${x.proxyURL})`)
          .join("\n");
        embed.addField("Attachment(s) (ID: link)", content);
      } else {
        const array = message.attachments.array();
        const first = array
          .filter((x, index) => index < 5)
          .map(x => `${x.id} : [link](${x.proxyURL})`)
          .join("\n");
        const last = array
          .splice(0, 5)
          .map(x => `${x.id} : [link](${x.proxyURL})`)
          .join("\n");
        embed
          .addField("Attachment(s) (ID: link)", first)
          .addField("Attachment(s) (continued)", last);
      }
    }
    hook.send(embed).catch(async error => {
      if (error.code === 10015) {
        const data = delete (await globalLogHooks.get(message.guild.id))
          .message;
        globalLogHooks.set(message.guild.id, data);
      } else throw error;
    });
  }
};
