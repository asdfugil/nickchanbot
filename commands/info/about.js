const { MessageEmbed } = require("discord.js")
module.exports = {
  name:"about",
  description:{ en:"shows bot information" },
  async execute (message) {
    const { client } = message
    const embed = new MessageEmbed()
    .setColor("RAMDOM")
    .setTitle(client.user.username + ` v${require('../../package.json').version}`)
    .setAuthor(client.owner.tag,client.owner.displayAvatarURL())
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(`${client.user.tag} is a bot developed by ${client.owner.tag}.`)
    .addField("Developers",client.developers.map(開發者 => 開發者.tag).join(", "))
    .addField('Version',require('../../package.json').version) 
    message.channel.send(embed)
  }
}