module.exports = client => {
  const { loggers } = client;
  client
    .on("typingStart", (channel, user) => loggers.get("typingStart").execute(channel, user))
    .on("typingStop",(channel,user) => loggers.get("typingStop").execute(channel,user))
    .on("message",message => {loggers.get("message").execute(message)})
};