var http = require('http');

//create a server object:
http.createServer(function (req, res) {
  res.write('Ping! Nick Chan#5213\'s main script is working'); //write a response to the client
  res.end(); //end the response
}).listen(81)