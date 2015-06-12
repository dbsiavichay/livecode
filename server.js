var express = require('express'),
		bodyParser = require('body-parser'),
		swig = require('swig'),
		fs = require('fs')
		zip = new require('node-zip')();

var server = express();
var io = require('socket.io')(server.listen(process.env.PORT || 5000));
var currentData = {};

//Configuracion de vistas y archivos estaticos
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './public');
server.use(express.static('./public'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));


server.get('/', function(req, res){
	res.render('index');
});

server.get('/download', function (req, res) {
	res.download('project.zip', 'project.zip', function (err) {
		if(!err){
			fs.unlink('project.zip');
		}
	});
});

server.post('/data', function (req, res) {
	var data = req.body;
	fs.readFile('template.html', "utf-8", function (err, html) {
		if(!err){
			zip.file('js/main.js', data.js);
			zip.file('css/style.css', data.css);
			zip.file('index.html', html.replace('content', data.html));
			var project = zip.generate({base64:false,compression:'DEFLATE'});
			fs.writeFile('project.zip', project, 'binary');
			res.send({success: true});
		}else{
			res.send({success: false, message: err});
		}
	});
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
