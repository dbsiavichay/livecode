var express = require('express'),
		bodyParser = require('body-parser'),
		session = require('express-session'),
		cons = require('consolidate'),
		fs = require('fs'),
		zip = new require('node-zip')(),
		pg = require('pg');

var server = express();
var io = require('socket.io')(server.listen(process.env.PORT || 5000));
var currentData = {};
var viewData = {};

//Configuracion de vistas y archivos estaticos
server.engine('html', cons.swig);
server.set('view engine', 'html');
server.set('views', './public');
server.set('view cache', false);

server.use(express.static('./public'));
server.use(session({secret: 'abcd@1234', resave: false, saveUninitialized: true}));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));


server.get('/', function (req, res) {
	res.render('home', viewData);
});

server.get('/name/:name', function (req, res) {
	req.session.name = req.params.name;
	res.redirect('/name');
});

server.get('/name', function (req, res) {
	res.send(req.session.name);
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


function conectar () {
	console.log('conectando');
	var strConection = 'pg://postgres:eduubuye@081011@localhost:5432/livecodedb';

	var client = new pg.Client(strConection);
	client.connect(function (err) {
		if(err){
			console.log(err);
			return;
		}

		client.query('SELECT * FROM example_content WHERE id_example = 1', function (err, result) {
			if(err){
				console.log(err);
				return;
			}
			console.log(result.rows[0].data.html)
		});
	});
}
console.log('Servidor escuchando en http://localhost:5000');
