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
app.listen(process.env.WEBSITE_PORT, function () {
  console.log('Example app listening on port' + process.env.PORT+"!");
});
app.use(express.static('public'));