const { Bio } = require('discord.bio'); 
const { RichEmbed } = require('discord.js');
module.exports = {
  name:'bio',
  description: "shows user information from discord.bio",
  cooldown: 5,//Rate limit
  async execute(message,args) {
    const bio = new Bio()
    const slugOrID = args.join(' ')
    const profile = await bio.details(slugOrID)
    .catch(error => {
      message.reply('This user has no discord.bio profile')
    })
    if (!profile) return
    const connections = await bio.connections(slugOrID)
    let flags = []
    let connection_array = []
    for (const [key,value] of Object.entries(profile.discord.public_flags.serialize())) {
      if (value) flags.push(key)
    }
    for (const [key,value] of Object.entries(connections)) {
      if (value.name) connection_array.push(`**${key}:**${value.name}`)
    }
    const embed = new RichEmbed()
    .setColor("RANDOM")
    .setTitle(profile.discord.tag + "'s profile")
    .setDescription(profile.settings.description,'No description set')
    .addField('Flags',flags.join(',')||'None')
    .addField('Email',profile.settings.email || "not set")
    .addField('Gender',profile.settings.gender || "not set")
    .addField('Occupation',profile.settings.occupation || "not set")
    .addField('Location',profile.settings.location || "not set")
    .addField("Premium",profile.settings.premium)
    .addField("Verified",profile.settings.verified)
    .addField('Connections',connection_array.join('\n') || 'None')
    .setThumbnail(profile.discord.displayAvatarURL)
    .setFooter('⬆' + profile.settings.upvotes)
    if (profile.settings.banner) embed.setImage(profile.settings.banner)
    message.channel.send(embed)
    
  }

}
