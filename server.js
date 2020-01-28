require('dotenv').config()
const http = require('http')
http.createServer((request,response) => {
  response.write('OK')
  response.end()
}).listen(process.env.PORT || 3000)
require('./index.js')