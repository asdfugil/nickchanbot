module.exports = {
  name: "changelogs",
  description: "Shows bot changelogs",
  aliases:['whats-new','change-logs'],
  cooldown:5,
  execute: (message, args) => {message.channel.send(`
${message.client.user.username} beta 1.0.0
**Changelogs**
- Bot rewritten from scratch
- removed spam and spam-ping command
`)}
};
