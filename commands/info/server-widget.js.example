const { Message } = require('discord.js')
module.exports = {
  name:'server-widget',
  usage:{en:'<server_id>'},
  args:1,
  /**
   * 
   * @param { Message } message 
   * @param { string[] } args 
   */
  async execute(message,args) {
    return message.reply('Coming soon.')
    //@ts-ignore
    message.client.api.guilds(args.join(' '))['widget-json'].get()
  }
}