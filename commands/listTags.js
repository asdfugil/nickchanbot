const globalTags = new (require("keyv"))("sqlite://.data/database.sqlite", {
  namespace: "tags"
});
module.exports = {
  name: "listTags",
  aliases: ["list-tags"],
  description: "list tags(custom commands)",
  guildOnly: true,
  args: 0,
  async execute(message, args) {
    const tags =
      (await globalTags.get(message.guild.id)) || Object.create(null);
    message.channel.startTyping()
   await  message.channel.send(
      Object.keys(tags)
        .map(x => `\`${x}\``)
        .join(",") || "There are not tags set."
    );
    message.channel.stopTyping()
  }
};
