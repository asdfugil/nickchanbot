module.exports = client => {
  const { loggers } = client;
  client
    .on("typingStart", loggers.get("typingStart").execute)
    .on("typingStop", loggers.get("typingStop").execute)
    .on("message", loggers.get("message").execute)
    .on("raw", packet => {
      if (packet.t === "MESSAGE_DELETE_BULK")
        loggers.get("messageDeleteBulk").execute(packet, client);
    })
    .on("messageUpdate", loggers.get("messageUpdate").execute)
    .on("messageDelete", loggers.get("messageDelete").execute)
    .on("channelCreate", loggers.get("channelCreate").execute)
    .on("channelUpdate", loggers.get("channelUpdate").execute)
    .on("channelDelete", loggers.get("channelDelete").execute)
    .on("emojiCreate", loggers.get("emojiCreate").execute)
    .on("emojiDelete", loggers.get("emojiDelete").execute)
    .on("guildBanAdd", loggers.get("guildBanAdd").execute)
    .on("guildBanRemove", loggers.get("guildBanRemove").execute)
    .on(`guildMemberAdd`, loggers.get("guildMemberAdd").execute)
    .on("guildMemberRemove", loggers.get("guildMemberRemove").execute)
    .on("emojiUpdate", loggers.get("emojiUpdate").execute)
    .on("roleUpdate", loggers.get("roleUpdate").execute)
    .on("roleDelete", loggers.get("roleDelete").execute)
    .on("roleCreate", loggers.get("roleCreate").execute);
};
