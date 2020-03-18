#!/usr/bin/env node
require('dotenv').config()
const express = require('express');
const app = express();
const Keyv = require('keyv')
const ranks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "ranks"
});
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.send('OK');
});
app.listen(process.env.PORT, function () {
  console.log('Example app listening on port' + process.env.PORT+"!");
});
app.use(express.static('public'));
app.get('/api/v0/ranks',async (req,res) => {
    const guild_id = req.query.guild_id
    if (!guild_id) {
      res.send('{"message":"guild_id is a required argument that is missing"}')
      res.end()
      return
    }
  const data = await ranks.get(guild_id)
  res.send(data)
  res.end()
})
require('./index.js')
