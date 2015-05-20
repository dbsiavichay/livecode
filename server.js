var server = require('express')();

server.get('/', function(req, res){
  res.send('Hola mundo');
});

server.listen(5000, function () {
	console.log('Servidor escuchando en http://localhost:5000');
});