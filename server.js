require('dotenv').config()
const express = require('express');
const app = express();
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.send('OK');
});
app.listen(process.env.PORT, function () {
  console.log('Example app listening on port' + process.env.PORT+"!");
});
app.use(express.static('public'));
require('./index.js')