console.log("Launching shard manager...");
require("dotenv").config();
const { ShardingManager, WebhookClient } = require("discord.js");
const { TOKEN } = process.env;
const manager = new ShardingManager("./bot.js", { token: TOKEN,mode:'process' });
manager.spawn(1, 4000)
manager.on("launch", shard => console.log(`Launched shard ${shard.id}.`));
manager.on("message", (shard, receivedMessage) => {
  console.log("Message received from shard " + shard.id);
  console.log(receivedMessage._eval);
  console.log(receivedMessage._result);
});
