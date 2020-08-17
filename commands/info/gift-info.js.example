const { Message } = require('discord.js')
module.exports = {
  name:'gift-info',
  usage:{en:'<gift-codes>'},
  args:1,
  /**
   * 
   * @param { Message } message 
   * @param { string[] } args 
   */
  async execute(message,args) {
    return message.reply('Coming soon.')
    //@ts-ignore
    message.client.api.entitlements['gift-codes'].get(args.join(' '))
  }
}