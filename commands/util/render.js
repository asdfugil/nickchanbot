const nodeHtmlToImage = require('node-html-to-image')
const { MessageAttachment,Message } = require('discord.js');
const { default: fetch } = require('node-fetch');
module.exports = {
  name: 'render',
  description: { en: 'render HTML' },
  usage: { en: '<html>' },
  args: false,
  cooldown: 10,
  /**
   * 
   * @param { Message } message 
   * @param { string[] } args 
   */
  async execute(message, args) {
    message.channel.startTyping()
    let source;
    if (message.attachments.first()) {
      source = await fetch(message.attachments.first().url,{ headers:{'user-agent':process.env.USER_AGENT} }).then(res => res.text())
    } else source = args.join(' ')
    message.channel.send(new MessageAttachment(await nodeHtmlToImage({ html:source,type:'jpeg',quality:100,puppeterArgs:{
      ignoreHTTPSErrors:true,
      defaultViewport:{
        width:3840,
        hight:2160
      },
      args:['--javascript-harmony']
    } }) || Buffer.from('Error rendering HTML','utf8')))
    message.channel.stopTyping()
  }
}