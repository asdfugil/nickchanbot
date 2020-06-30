require("dotenv").config();
const express = require("express");
const app = express();
const Keyv = require("keyv");
const proxy = require("express-http-proxy");
const fs = require('fs')
const ranks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "ranks"
});
const fetch = require("node-fetch");
app.use(express.static("public"));
app.get("/", function(req, res) {
  res.send("OK");
});
app.listen(process.env.PORT, function() {
  console.log("Example app listening on port" + process.env.PORT + "!");
});
app.use(express.static("public"));
app.get("/api/v0/ranks", async (req, res) => {
  res.set("Content-Type", "application/json; charset=utf-8");
  const guild_id = req.query.guild_id;
  if (!guild_id) {
    res
      .status(400)
      .send('{"message":"guild_id is a required argument that is missing"}');
    res.end();
  }
  const data = await ranks.get(guild_id);
  res.send(data);
  res.end();
});

app.get("/api/secret/noulmao", (req,res) => {
  const { r,f } = req.query
    console.log(req.get('user-agent'))
  if (! (r && f)) res.status(400).send('Bad Request')
  const html = fs.readFileSync(__dirname + '/documents/redirect-template.html','utf8')
  if (req.get('user-agent').toLowerCase().includes('discordbot')) {
    res.send(html.replace('kAC46xQE6Z_O_kKXG13G5GXe',f))
  } else res.send(html.replace('kAC46xQE6Z_O_kKXG13G5GXe',r))
});

require("./index.js");
