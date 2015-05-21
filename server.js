var express = require('express'),
	swig = require('swig');
var server = express();
var io = require('socket.io')(server.listen(5000));

//Configuracion de vistas y archivos estaticos
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './public');
server.use(express.static('./public'));


server.get('/', function(req, res){
	res.render('index');
});

io.on('connection', function (socket) {  
	socket.on('livecode', function (data) {
		socket.broadcast.emit('livecode', data);
	});
});

console.log('Servidor escuchando en http://localhost:5000');