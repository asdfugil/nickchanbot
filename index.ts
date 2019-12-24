console.log('Launching shard manager...')
const { ShardingManager } = require('discord.js')
const { Shard } = require('discord.js')
const botConfig = require('./config/config.js')
const manager = new ShardingManager('./bot.ts', {token:botConfig.token})
manager.spawn(5,4000);
manager.on('launch', shard => console.log(`Launched shard ${shard.id}.`));
manager.on("message",(shard,receivedMessage) => {
  console.log("Message received from shard " + shard.id)
  console.log(receivedMessage._eval)
  console.log(receivedMessage._result)
})

