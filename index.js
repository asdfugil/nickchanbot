console.log('Launching shard manager...')
require('dotenv').config()
const { ShardingManager } = require('discord.js')
const { TOKEN } = process.env
const manager = new ShardingManager('./bot.js', {token:TOKEN})
console.log("| |/ /__ _ __| |_ (_)_ __  __ _\n| ' </ _` (_-< ' \\| | '  \\/ _` |\n|_|\\_\\__,_/__/_||_|_|_|_|_\\__,_|\n");

manager.spawn(1,4000, false)
manager.on('launch', shard => console.log(`Launched shard ${shard.id}.`));
manager.on("message",(shard,receivedMessage) => {
  console.log("Message received from shard " + shard.id)
  console.log(receivedMessage._eval)
  console.log(receivedMessage._result)
})

