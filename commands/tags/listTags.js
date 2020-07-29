const { tags } = require('../../sequelize')
module.exports = {
  name: "listTags",
  aliases: ["list-tags"],
  description: "list tags (custom commands)",
  guildOnly: true,
  args: 0,
  async execute(message, args) {
    const guildTags =
    (await tags.findOne({where:{guild_id:message.guild.id}}))?.dataValues?.tags || Object.create(null)
    message.channel.startTyping()
   await  message.channel.send(
      Object.keys(guildTags)
        .map(x => `\`${x}\``)
        .join(",") || "There are no tags set."
    );
    message.channel.stopTyping()
  }
};