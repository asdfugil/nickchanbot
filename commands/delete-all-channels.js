const {
  noPermission,
  noBotPermission
} = require("../custom_modules/ncbutil.js");
let deleted = false
module.exports = {
  name: "delete-all-channels",
  cooldown: 300,
  guildOnly: true,
  description: "Delete all channels,will ask for confirmation",
  execute:async message => {
    if (!message.member.hasPermission("ADMINISTRATOR"))
      return noPermission("Administrator",message.channel)
    if (!message.guild.me.hasPermission("ADMINISTRATOR"))
      return noBotPermission("Administrator",message.channel)
    message
      .reply("Are you sure? (15 seconds)")
      .then(async m => {
        await m.react("✅");
        return m;
      })
      .then(m =>
        m
          .createReactionCollector(
            (r, u) => r.emoji.name === "✅" && u.id === message.author.id,
            { time: 15000 }
          )
          .on("collect", async () => {
      await message.channel.send(`${message.client.emojis.get('663337946027524108')} Deleting channels...`)
      deleted = true
            message.guild.channels.forEach(async channel => {
              if (!channel.deleted)
              await channel
                .delete(`${message.author.tag} - delete all channels.`)
                .catch(error => {
                if (!message.channel.deleted) message.channel.send(error.toString(),{code:'xl'})
              })
            });
          })
            .on('end',() => {
      if (!deleted) m.edit('Command cancelled') 
    })
      );
  }
};
