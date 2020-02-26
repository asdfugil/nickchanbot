const fetch = require("node-fetch");
module.exports = {
  name: "8ball",
  description: "Ask your questions to the magical 8ball .",
  aliases: ["8-ball", "eightball", "eight-ball"],
  cooldown: 1,
  async execute(message, args) {
    // execute MUST return a promise
    const slugArg = args[0];
    const genders = ["Not set.", "Male", "Female"];
    /**
     * Endpoints:
     * Details (Base) - https://api.discord.bio/v1/getUserDetails/<user id or slug (string)>
     * Discord Connections (Discord profile)- https://api.discord.bio/v1/getDiscordConnections/<user id or slug (string)>
     * Connections (Social Media) - https://api.discord.bio/v1/getUserConnections/<user id or slug (string)>
     * (_Yeah, there's no official API documentation_, so I decided to snoop these things by using Chrome's network traffic tracker)
     */
    // embed.enabled ? 'enabled' : 'disabled'
    const user =
      message.mentions.users.first() ||
      args[0] ||
      message.client.users.get(args[0]) ||
      message.client.users.get(message.author.id);
    const userID = user.id || slugArg;
    const bioDetails = await fetch(
      `https://api.discord.bio/v1/UserDetails/${userID}`
    ).then(res => res.json());
    const bioDiscordConnections = await fetch(
      `https://api.discord.bio/v1/DiscordConnections/${userID}`
    ).then(res => res.json());
    const bioConnections = await fetch(
      `https://api.discord.bio/v1/UserConnections/${userID}`
    ).then(res => res.json());
    if (bioDetails.success === false) {
      return message.channel.send(
        "User not registered on https://discord.bio/."
      );
    }
    const dominantColor = await fetch(
      `https://color.aero.bot/dominant?image=https://cdn.discordapp.com/avatars/${bioDetails.discord.id}/${bioDetails.discord.avatar}.png`
    ).then(res => res.text());
    const bioEmbed = new RichEmbed()
      .setColor(dominantColor)
      .setAuthor(
        `${bioDetails.discord.username}#${bioDetails.discord.discriminator} (${bioDetails.settings.view_count} views)`,
        `https://cdn.discordapp.com/avatars/${bioDetails.discord.id}/${bioDetails.discord.avatar}.png?size=2048`,
        `https://dsc.bio/${bioDetails.settings.name}`
      )
      .setTitle("Biography")
      .setDescription(
        "Contains a user information from [discord.bio](https://discord.bio)."
      )
      .setThumbnail(
        `https://cdn.discordapp.com/avatars/${bioDetails.discord.id}/${bioDetails.discord.avatar}.png?size=2048`
      )
      .addField("discord.bio's ID", `\`${bioDetails.settings.id}\``, true)
      .addField(
        "Slug",
        `[${bioDetails.settings.name}](https://dsc.bio/${bioDetails.settings.name})` +
          ` (\`${bioDetails.settings.slug_id}\`)`,
        true
      )
      .addField(
        "Status",
        bioDetails.settings.status ? bioDetails.settings.status : "_Not set._",
        true
      )
      .addField(
        "Gender",
        bioDetails.settings.gender
          ? genders[bioDetails.settings.gender]
          : "_Not set._",
        true
      )
      .addField(
        "Description",
        bioDetails.settings.description
          ? bioDetails.settings.description
          : "_Not set._"
      )
      .addField(
        "Registered at",
        moment(bioDetails.settings.created_at).format(
          "dddd, D MMMM YYYY[\n][at] HH:mm:ss ([UTC] Z)"
        ),
        true
      )
      .addField(
        "Birthdate",
        bioDetails.settings.birthday
          ? moment(bioDetails.settings.birthday).format("dddd, D MMMM YYYY")
          : "_Not set._",
        true
      )
      .addField(
        "Occupation",
        bioDetails.settings.occupation
          ? bioDetails.settings.occupation
          : "_Not set._",
        true
      )
      .addField(
        "Location",
        bioDetails.settings.location
          ? bioDetails.settings.location
          : "_Not set._",
        true
      );
    for (const connection of bioDiscordConnections) {
      const data = [];
      for (const item of Object.keys(connection)) {
        if (item !== "connection_type")
          data.push(`**${item}:** ${connection[item]}`);
      }
      bioEmbed.addField(connection.connection_type, data.join("\n"));
    }
    message.channel.send(bioEmbed);
  }
};
// Special thanks to FAV

