var express = require('express'),
		bodyParser = require('body-parser'),
		session = require('express-session'),
		swig = require('swig'),
		fs = require('fs'),
		zip = new require('node-zip')();

var server = express();
var io = require('socket.io')(server.listen(process.env.PORT || 5000));
var currentData = {html: '', css: '', js: ''};
var ejemplos = [{
	id: 1,
	nombre: 'Portafolio'
}];

//Configuracion de vistas y archivos estaticos
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './public');
server.set('view cache', false);

server.use(express.static('./public'));
server.use(session({secret: 'abcd@1234', resave: false, saveUninitialized: true}));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));


server.get('/', function (req, res) {
	var user = req.session.user?req.session.user:'';
	res.render('home', {user : user, ejemplos: ejemplos});
});

server.get('/login', function (req, res) {
	if(req.session.user) res.redirect('/');
	res.render('login');
});

server.get('/logout', function (req, res) {
	if(req.session.user) req.session.destroy();
	res.redirect('/login');
});

server.get('/examples/:id', function (req, res) {
	var id = req.params.id;
	if(id === 'ejem-1'){
		fs.readFile('./public/examples/portafolio/archivo.html', "utf-8", function (errh, html) {
			if(!errh){
				fs.readFile('./public/examples/portafolio/archivo.css', "utf-8", function (errc, css) {
					if(!errc) {
						res.json({html: html, css: css, js: ''});
					}else{
						res.send(errc);
					}
				});
			}else{
				res.send(errh);
			}
		});
	}
});

server.get('/download', function (req, res) {
	res.download('project.zip', 'project.zip', function (err) {
		if(!err){
			fs.unlink('project.zip');
		}
	});
});

server.post('/login', function (req, res) {
	req.session.user = req.body.cedula;
	res.redirect('/');
});

server.post('/prepare-download', function (req, res) {
	var data = req.body;
	fs.readFile('./public/examples/template.html', "utf-8", function (err, html) {
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
