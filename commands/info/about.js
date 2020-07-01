const { MessageEmbed } = require("discord.js")
module.exports = {
  name:"about",
  description:{ en:"shows bot information" },
  async execute (message) {
    const { client } = message
    const embed = new MessageEmbed()
    .setColor("RAMDOM")
    .setTitle("About")
    .setAuthor(client.owner.tag,client.owner.displayAvatarURL())
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(`${client.user.tag} is a bot developed by ${client.owner.tag}.`)
    .addField("Developers",client.developers.map(開發者 => 開發者.tag).join(", ")) 
    message.channel.send(embed)
  }
}