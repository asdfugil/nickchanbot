console.log('Launching shard manager...')
require('dotenv').config()
const { ShardingManager } = require('discord.js')
const { BOT_TOKEN } = process.env
const manager = new ShardingManager('./bot.js', {token:BOT_TOKEN})
manager.spawn(1,4000);
manager.on('launch', shard => console.log(`Launched shard ${shard.id}.`));
manager.on("message",(shard,receivedMessage) => {
  console.log("Message received from shard " + shard.id)
  console.log(receivedMessage._eval)
  console.log(receivedMessage._result)
})

