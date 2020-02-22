const { WebhookClient } = require('discord.js')
const stdout = new WebhookClient('680631969830141968','0o2pnuKcuEVATglfcCZ30mW7fqVpHkO36AyuSRoWS_ARRWxg3zmV0VMOROvzBO_jnLVI')
module.exports = () => {
  process.stdout.on("data",data => stdout.send(data.toString()))
}