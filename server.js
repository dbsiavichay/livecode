var express = require('express'),
	swig = require('swig');
var server = express();
var io = require('socket.io')(server.listen(process.env.PORT || 5000));
var currentData = {};

//Configuracion de vistas y archivos estaticos
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './public');
server.use(express.static('./public'));


server.get('/', function(req, res){	
	res.render('index');
});

io.on('connection', function (socket) {
	socket.emit('livecode', currentData);
	socket.on('livecode', function (data) {	
		for(attr in data){
			if(attr === 'html') currentData.html = data.html;
			if(attr === 'css') currentData.css = data.css;
			if(attr === 'js') currentData.js = data.js;
		}
		socket.broadcast.emit('livecode', data);
	});
});


console.log('Servidor escuchando en http://localhost:5000');