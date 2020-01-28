const {
  noPermission,
  noBotPermission
} = require("../custom_modules/ncbutil.js");
let deleted = false;
module.exports = {
  name: "delete-server",
  aliases: ["delete-guild", "deleteguild"],
  description:
    "Deletes the server. (If the bot and the command invoker is both owner lol)",
  cooldown: 2,
  guildOnly:true,
  execute:async message => {
    if (message.author.id !== message.guild.owner.id)
      return noPermission("Server Owner",message.channel)
    if (message.client.user.id !== message.guild.owner.id)
      return noBotPermission("Server Owner",message.channel)
    //useless code
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
          .on("collect", () => {
            message.guild.delete().catch(console.error);
          })
          .on("end", () => {
            if (!deleted) m.edit("Command cancelled");
          })
      );
  }
};
