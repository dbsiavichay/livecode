var express = require('express'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	swig = require('swig'),
	fs = require('fs'),
	zip = new require('node-zip')(),
	examples = require('./private/examples'),
	materiales = require('./private/material');

var server = express();
var io = require('socket.io')(server.listen(process.env.PORT || 5000));
var currentData = {html: '', css: '', js: ''};
var currentData2 = {html: '', css: '', js: ''};
var currentData3 = {html: '', css: '', js: ''};
var sockets1 = [];
var sockets2 = [];
var sockets3 = [];
var petsExamples = [];

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
	var _examples = examples;
	var _materiales = materiales;
	if (examples.length > 5) _examples = examples.slice(0, 5);
	if (materiales.length > 5) _materiales = materiales.slice(0, 5);

	var user = req.session.user?req.session.user:'';
	res.render('home', {user : user, ejemplos: _examples, materiales: _materiales});
});

server.get('/login', function (req, res) {
	if(req.session.user) res.redirect('/');
	res.render('login');
});

server.get('/logout', function (req, res) {
	if(req.session.user) req.session.destroy();
	res.redirect('/login');
});

server.get('/material', function (req, res) {
	if(!req.session.user) {
		res.redirect('/login');
		return;
	}

	res.render('material', {materiales: materiales, can_delete: req.session.user.esDocente});
});

server.get('/examples', function (req, res) {
	if(!req.session.user) {
		res.redirect('/login');
		return;
	}

	res.render('example', {examples : examples, can_delete: req.session.user.esDocente});
});

server.get('/examples/:id', function (req, res) {
	var id = parseInt(req.params.id);
	var example = null;
	for(var i = 0; i<examples.length; i++) {
		if(id === examples[i].id){
			example = {html: examples[i].html, css: examples[i].css, js: examples[i].js};
			break;
		}
	}
	if(example) res.json(example);
	else res.send('No records found');
});

server.get('/loadexample', function (req, res) {
	var example = null;
	for(var i=0;i<petsExamples.length;i++){
		if(req.session.user.cedula === petsExamples[i].user.cedula) {
			example = petsExamples[i].example;
			petsExamples.splice(i,1);
			break;
		}
	}

	res.json(example);
});

server.post('/loadexample', function (req, res) {
	var id = parseInt(req.body.id);	
	var example = null;
	for(var i = 0; i<examples.length; i++) {
		if(id === examples[i].id){
			example = {html: examples[i].html, css: examples[i].css, js: examples[i].js};
			break;
		}
	}

	if(example) {
		petsExamples.push({example: example, user: req.session.user});
		res.send({success: true});
	}else{
		res.send({success: false});
	}
});

server.get('/download', function (req, res) {
	res.download('project.zip', 'project.zip', function (err) {
		if(!err){
			fs.unlink('project.zip');
		}
	});
});

server.post('/examples', function (req, res) {
	var today = new Date();
	var currentId = examples.length > 0?parseInt(examples[0].id)+1:1;
	var example = req.body;
	example.id = currentId;
	example.date = today.getDate() +'/'+(today.getMonth()+1)+'/'+today.getFullYear();
	examples.unshift(example);
	fs.writeFile('./private/examples.json', JSON.stringify(examples), function (err) {
		res.send(err);
	});
});

server.post('/material', function (req, res) {
	var today = new Date();
	var currentId = materiales.length > 0?parseInt(materiales[0].id)+1:1;
	var material = req.body;
	material.id = currentId;
	material.date = today.getDate() +'/'+(today.getMonth()+1)+'/'+today.getFullYear();
	materiales.unshift(material);
	fs.writeFile('./private/material.json', JSON.stringify(materiales), function (err) {
		res.send(err);
	});
});

server.delete('/examples/:id', function (req, res) {
	var id = parseInt(req.params.id);
	var index=-1;

	for(var i = 0; i < examples.length; i++) {
		if(examples[i].id === id) {
			index = i;
			break;
		}
	}

	if(index > -1) {
		examples.splice(index, 1);
		fs.writeFile('./private/examples.json', JSON.stringify(examples), function (err) {
			if(err) res.send({error: err});
		});
		res.send({success: true});
	}else{
		res.send({error: 'Not found'});
	}

});

server.post('/login', function (req, res) {	
	var user = req.body;
	if(user.esDocente === 'false') user.esDocente = false;
	else user.esDocente = true;

	user.nombre = user.nombres.split(" ")[0] + " " + user.apellidos.split(" ")[0];
	req.session.user = user;
	res.redirect('/');
});

server.post('/prepare-download', function (req, res) {
	var data = req.body;
	fs.readFile('./private/template.html', "utf-8", function (err, html) {
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
	//socket.emit('livecode', currentData);
	socket.on('livecode', function (data) {
		if(data===null) {
			sockets1.push(socket);
			socket.emit('livecode', currentData);
			return;
		}

		for(attr in data){
			if(attr === 'html') currentData.html = data.html;
			if(attr === 'css') currentData.css = data.css;
			if(attr === 'js') currentData.js = data.js;
		}

		//socket.broadcast.emit('livecode', data);
		sockets1.forEach(function (sock) {
			if(sock.id!=socket.id) {
				sock.emit('livecode', data);
			}
		});
	});

	socket.on('livecode2', function (data) {
		if(data===null) {
			sockets2.push(socket);
			socket.emit('livecode', currentData2);
			return;
		}

		for(attr in data){
			if(attr === 'html') currentData2.html = data.html;
			if(attr === 'css') currentData2.css = data.css;
			if(attr === 'js') currentData2.js = data.js;
		}

		sockets2.forEach(function (sock) {
			if(sock.id!=socket.id) {
				sock.emit('livecode', data);
			}
		});
	});

	socket.on('livecode3', function (data) {
		if(data===null) {
			sockets3.push(socket);
			socket.emit('livecode', currentData3);
			return;
		}

		for(attr in data){
			if(attr === 'html') currentData3.html = data.html;
			if(attr === 'css') currentData3.css = data.css;
			if(attr === 'js') currentData3.js = data.js;
		}

		sockets3.forEach(function (sock) {
			if(sock.id!=socket.id) {
				sock.emit('livecode', data);
			}
		});
	});

	socket.on('chat', function (data) {
		socket.broadcast.emit('chat', data);
	});
});

console.log('Servidor escuchando en http://localhost:5000');
