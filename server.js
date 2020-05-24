require('dotenv').config()
const express = require('express');
const app = express();
const Keyv = require('keyv')
const proxy = require('express-http-proxy')
const ranks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "ranks"
});
const fetch = require('node-fetch')
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.send('OK');
});
app.listen(process.env.PORT, function () {
  console.log('Example app listening on port' + process.env.PORT+"!");
});
app.use(express.static('public'));
app.get('/api/v0/ranks',async (req,res) => {
  res.set("Content-Type","application/json; charset=utf-8")
    const guild_id = req.query.guild_id
    if (!guild_id) {
      res.status(400).send('{"message":"guild_id is a required argument that is missing"}')
      res.end()
    }
  const data = await ranks.get(guild_id)
  res.send(data)
  res.end()
})

app.get('/api/secret/37712745',proxy('localhost:1084'))
require('./index.js')