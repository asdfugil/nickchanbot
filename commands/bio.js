const { Bio } = require("discord.bio");
const { RichEmbed } = require("discord.js");
module.exports = {
  name: "bio",
  description: "shows user information from discord.bio",
  cooldown: 5, //Rate limit
  async execute(message, args) {
    const bio = new Bio();
    const slugOrID = args.join(" ") || message.author.id;
    const profile = await bio.users.details(slugOrID).catch(error => {
      message.reply("This user has no discord.bio profile");
    });
    if (!profile) return;
    let flags = [];
    let connection_array = [];
    for (const [key, value] of Object.entries(
      profile.discord.public_flags.serialize()
    )) {
      if (value) flags.push(key);
    }
    for (const [key, value] of Object.entries(profile.user.userConnections)) {
      connection_array.push(`**${key}:**${value}`);
    }
    for (const dconn of profile.user.discordConnections) {
      if (dconn.name) connection_array.push(`**${dconn.name} (${dconn.connection_type}):**${dconn.url}`);
    }
    const embed = new RichEmbed()
      .setColor("RANDOM")
      .setTitle(profile.discord.tag + "'s profile")
      .setDescription(profile.user.details.description, "No description set")
      .addField("Flags", flags.join(",") || "None", true)
      .addField("Email", profile.user.details.email || "not set", true)
      .addField("Gender", profile.user.details.gender || "not set", true)
      .addField("Occupation", profile.user.details.occupation || "not set", true)
      .addField("Location", profile.user.details.location || "not set", true)
      .addField("Premium", profile.user.details.premium, true)
      .addField("Verified", profile.user.details.verified, true)
      .addField("Connections", connection_array.join("\n") || "None", true)
      .setThumbnail(
        profile.discord.displayAvatarURL({
          size: 1024,
          dynamic: true,
          format: "png"
        })
      )
      .setFooter("⬆" + profile.user.details.upvotes);
    if (profile.user.details.banner)
      embed.setImage(profile.user.details.banner);
    message.channel.send(embed);
  }
};
