var express = require('express'),
	swig = require('swig');

var server = express();

server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './public');

server.get('/', function(req, res){
  res.render('index');
});

server.use(express.static('./public'));

server.listen(5000, function () {
	console.log('Servidor escuchando en http://localhost:5000');
});