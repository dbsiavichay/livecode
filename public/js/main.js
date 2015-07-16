$(function () {
	var htmlEditor, cssEditor, jsEditor, socket;
	var data = {};
	var colaborate = false;

	createHtmlEditor();
	data.html = htmlEditor.getValue();
	renderPreview();

	function createHtmlEditor () {
		if(!htmlEditor){
			htmlEditor = CodeMirror.fromTextArea(htmlTextArea, {
				lineNumbers:true,
				mode: 'htmlmixed',
				extraKeys: {
        	"Esc": function(cm) {
          	if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        	}
      	}
			});

			htmlEditor.on("change", function (editor, event) {
				data.html = htmlEditor.getValue();
				if(event.origin != 'setValue' && event.origin != undefined && colaborate) {
					socket.emit('livecode', {html: data.html, event: event});
				}
				setTimeout(renderPreview, 300);
			});
		}

		if(data.html!=undefined) htmlEditor.setValue(data.html);
	}

	function createCssEditor () {
		if(!cssEditor){
			cssEditor = CodeMirror.fromTextArea(cssTextArea, {
				lineNumbers:true,
				mode: 'css',
				extraKeys: {
        	"Esc": function(cm) {
          	if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        	}
      	}
			});

			cssEditor.on("change", function (editor, event) {
				data.css = cssEditor.getValue();
				if(event.origin != 'setValue' && event.origin != undefined && colaborate) {
					socket.emit('livecode', {css: data.css, event: event});
				}
				setTimeout(renderPreview, 300);
			});
		}

		if(data.css!=undefined) cssEditor.setValue(data.css);
	}

	function createJsEditor () {
		if(!jsEditor){
			jsEditor = CodeMirror.fromTextArea(jsTextArea, {
				lineNumbers:true,
				mode: 'javascript',
				extraKeys: {
        	"Esc": function(cm) {
          	if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        	}
      	}
			});

			jsEditor.on("change", function (editor, event) {
				data.js = jsEditor.getValue();
				if(event.origin != 'setValue' && event.origin != undefined && colaborate) {
					socket.emit('livecode', {js: data.js, event: event});
				}
				setTimeout(renderPreview, 300);
			});
		}

		if(data.js!=undefined) jsEditor.setValue(data.js);
	}

	function renderPreview() {
		var previewFrame = document.getElementById('preview');
		var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
		preview.open();

		if(data.css){
			preview.write('<style type="text/css">' + data.css + '</style>');
		}
		if(data.html){
			preview.write(data.html);
		}
		if(data.js){
			preview.write('<script>' + data.js + '</script>');
		}
		preview.close();
		$('#preview').contents().find('a').click(function(event) { event.preventDefault(); });
		if($(window).width()<992){
			$("#preview").height($("#preview").contents().find("html").height());
		}
	}

	$('.btn-fullscreen').on('click', function (event) {
		event.preventDefault();
		var editor;
		var origin = $(this).siblings().html().toLowerCase();
		if(origin === 'html') editor = htmlEditor;
		if(origin === 'css') editor = cssEditor;
		if(origin === 'js') editor = jsEditor;

		editor.setOption('fullScreen', true);
		editor.focus();
	})

	//Resposive e interaccion de usuario
	if($(window).width()>991){
		createCssEditor();
		createJsEditor();
	}

	var tabs = $('.nav-tabs').children();

	tabs.on('click', function (){
		var tab = $(this).text().toLowerCase().trim();

		if(tab==='html') setTimeout(createHtmlEditor, 5);
		if(tab==='css') setTimeout(createCssEditor, 5);
		if(tab==='js') setTimeout(createJsEditor, 5);
	});

	$(window).on('resize', function () {
		var previewIframe = $('#preview');

		if($(window).width()<992){
			if(!previewIframe.attr('style')){
				$("#preview").height($("#preview").contents().find("html").height());
			}
			return;
		}

		setTimeout(createCssEditor, 5);
		setTimeout(createJsEditor, 5);

		if(previewIframe.attr('style')){
			previewIframe.removeAttr('style');
		}
	});

	//Colaboracion remota
	$('#confirmar').on('click', function (event) {
		event.preventDefault();
		if(colaborate) return;
		$('#modal-confirmar').modal('show');
	});

	$('#colaborar').on('click', function (event) {
		event.preventDefault();
		colaborate = true;
		$('#modal-confirmar').modal('hide');
		$('#openchat').show();
		socket = io.connect(window.location.href);

		socket.on('livecode', function (_data) {
			if(_data.event === undefined){
				for(attr in _data){
					if(attr === 'html') {
						data.html = _data.html
						if(htmlEditor) htmlEditor.setValue(_data.html);
					}
					if(attr === 'css') {
						data.css = _data.css;
						if(cssEditor) cssEditor.setValue(_data.css);
					}
					if(attr === 'js') {
						data.js = _data.js;
						if(jsEditor) jsEditor.setValue(_data.js);
					}
				}
			}else{
				for(attr in _data){
					if(attr === 'html') {
						data.html = _data.html
						if(htmlEditor) htmlEditor.replaceRange(_data.event.text, _data.event.from, _data.event.to);
					}
					if(attr === 'css') {
						data.css = _data.css;
						if(cssEditor) cssEditor.replaceRange(_data.event.text, _data.event.from, _data.event.to);
					}
					if(attr === 'js') {
						data.js = _data.js;
						if(jsEditor) jsEditor.replaceRange(_data.event.text, _data.event.from, _data.event.to);
					}
				}
			}
			renderPreview();
		});

		socket.on('chat', function (_data) {
			var item =  '<li class="left clearfix">'+
				            '<div class="message-body clearfix">'+
				              '<div class="header">'+
				              	'<strong class="primary-font">'+_data.user+'</strong>'+
												'<small class="pull-right text-muted">'+
				                	'<span class="glyphicon glyphicon-time"></span>'+ _data.when +
												'</small>'+
				              '</div>'+
				              '<p>'+ _data.message+'</p>'+
				            '</div>'+
				          '</li>';
		  $('.message').prepend(item);
		});
	});

	// Descarga de proyectos
	$('#descargar').on('click', function (event) {
		event.preventDefault();
		var html = $('#preview').contents().find('body').children().get(0).outerHTML;
		$.post('/prepare-download', {css: data.css, html: html, js: data.js}, function (data) {
			if(data.success){
				window.location.href = '/download';
			}else{
				console.log(data.message);
			}
		});
	});

	//Carga de ejemplos
	$('.ejemplo').on('click', function (event) {
		event.preventDefault();
		var id = $(this).attr('id');
		$.get('/examples/'+id)
			.success(function (_data) {
				data = _data;
				htmlEditor.setValue(data.html);
				if(cssEditor) cssEditor.setValue(data.css);
				if(jsEditor) jsEditor.setValue(data.js);
			});
	});

	//Chat de usuarios
	$('#openchat').on('click', function (event) {
		event.preventDefault();
		$('.chat').slideDown();
		$('#openchat').hide();
	});

	$('#closechat').on('click', function (event) {
		event.preventDefault();
		$('.chat').slideUp();
		$('#openchat').show();
	});

	$('#messagechat').on('keypress', function (event) {
		if(event.keyCode===13){
			sendchat();
		}
	});

	$('#sendchat').on('click', sendchat);

	function sendchat (event) {
		if(event) event.preventDefault();
		var message = $('#messagechat').val();
		if(!message) return;
		var date = new Date();
		var user = $('#user').html();
		var when = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
		var item = '<li class="right clearfix">'+
								'<div class="message-body clearfix">'+
									'<div class="header">'+
										'<small class=" text-muted">'+
											'<span class="glyphicon glyphicon-time"></span>'+ when +
										'</small>'+
										'<strong class="pull-right primary-font">Yo</strong>'+
									'</div>'+
									'<p>'+ message +'</p>'+
								'</div>'+
							'</li>';
		socket.emit('chat', {user: user, when: when, message: message})
		$('.message').prepend(item);
		$('#messagechat').val('');
	}
});
