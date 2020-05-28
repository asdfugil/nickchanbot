require("dotenv").config();
const express = require("express");
const app = express();
const Keyv = require("keyv");
const { LOG_TOKEN } = process.env;
const { WebhookClient } = require("discord.js");
const ranks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "ranks"
});
const fetch = require('node-fetch')
app.use(express.static("public"));
app.get("/", function(req, res) {
  res.send("OK");
});
app.listen(process.env.PORT, function() {
  console.log("Example app listening on port" + process.env.PORT + "!");
});
app.use(express.static("public"));
app.get("/api/v0/ranks", async (req, res) => {
  const guild_id = req.query.guild_id;
  if (!guild_id) {
    res
      .status(400)
      .send('{"message":"guild_id is a required argument that is missing"}');
    res.end();
    return;
  }
  const data = await ranks.get(guild_id);
  res.send(data);
  res.end();
});
const child = require("child_process").exec("node index.js");
const hook = new WebhookClient(process.env.LOG_ID, LOG_TOKEN);
child.stdout.on("data", chunk =>
  hook.send(chunk.toString(), { split: true }).catch(console.error)
);
child.stderr.on("data", chunk =>
  hook.send(chunk.toString(), { split: true }).catch(console.error)
);
child.stdout.on("data", chunk => {
  console.log(chunk.substring(0, chunk.length - 1));
});
child.stderr.on("data", chunk =>
  console.error(chunk.substring(0, chunk.length - 1))
);
setInterval(() => {
fetch(`${process.env.PROJECT_DOMAIN}.gitch.me`)
},60000)