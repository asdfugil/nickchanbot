const Keyv = require("keyv");
const globalLogHooks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
const { WebhookClient, RichEmbed } = require("discord.js");
module.exports = {
  name: "messageDelete",
  logged: "a user deletes a message.",
  execute: async message => {
    if (message.system) return
    if (!message.guild) return;
      if (!await globalLogHooks.get(message.channel.guild.id)) return
    const hookData = (await globalLogHooks.get(message.guild.id)).messageDelete
    if (!hookData) return
    const hook = new WebhookClient(hookData.id, hookData.token);
    const embed = new RichEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL)
      .setColor("#ff0000")
      .setTitle("Message deletion log")
      .setDescription(message.content)
      .addField("Channel",message.channel.toString())
      .addField("Channel ID",message.channel.id)
      .addField("Message ID",message.id)
      .setTimestamp()
      .setFooter(message.client.user.tag, message.client.user.displayAvatarURL);
     if (message.attachments.first()) {
       const n = "If these are needed,save them as they will be deleted in a few days.\n"
      if (message.attachments.length < 5) {
      const content = message.attachments.map(x => `${x.id} : [link](${x.proxyURL})`).join('\n')
      embed.addField('Attachment(s) (ID: link)',n+content)
      } else {
        const array = [...message.attachments.array()]
        const first = array.filter((x,index) => index < 5).map(x => `${x.id} : [link](${x.proxyURL})`).join("\n")
        const last = array.splice(0,5).map(x => `${x.id} : [link](${x.proxyURL})`).join("\n")
        embed.addField('Attachment(s) (ID: link)',n+first)
             .addField("Attachments (continued)",last)
      }
    }
    hook.send({ embeds: [embed] })
      .catch(async error => {
      if (error.code === 10015) {
       const data = delete (await globalLogHooks.get(message.guild.id)).messageDelete
       globalLogHooks.set(message.guild.id,data)
      } else throw error
    })
  }
};
