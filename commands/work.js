const Keyv = require("keyv")
const gEconcomy = new Keyv("sqlite://.data/database.sqlite",{ namespace:"economy" })
const { RichEmbed,Message } = require('discord.js')
module.exports = {
  name:'work',
  hidden:true,
  description:'works and earn money',
  guildOnly:true,
  //cooldowns: cannot be used with a changable cooldown
  /**
   * @param { Message } message
   * @param { Array<string> } args
   */
  async execute (message,args) {
    //Load guild economy data
    /**
     * Guild Economy Data
     * @property { object } user
     */
    const economy = await gEconcomy.get(message.guild.id)

    
  }
}