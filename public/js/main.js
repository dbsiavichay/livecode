$(function () {
	var htmlEditor, cssEditor, jsEditor;
	var socket = io.connect(window.location.href);	

	createHtmlEditor();
	renderPreview({html: htmlEditor.getValue()});	

	function createHtmlEditor () {
		htmlEditor = CodeMirror.fromTextArea(htmlTextArea, {
			lineNumbers:true,
			mode: 'htmlmixed',
		});

		htmlEditor.on("change", function() { 
			var data = {
				html: htmlEditor.getValue(),
			};
			if(cssEditor) data.css = cssEditor.getValue();
			if(jsEditor) data.js = jsEditor.getValue();			
			setTimeout(function () {
				socket.emit('livecode', data);
				renderPreview(data);
			}, 300);		
		});
	}

	function createCssEditor () {
		cssEditor = CodeMirror.fromTextArea(cssTextArea, {
			lineNumbers:true,
			mode: 'css',		
		});

		cssEditor.on("change", function() {  		
			var data = {
				css: cssEditor.getValue(),
			};
			if(htmlEditor) data.html = htmlEditor.getValue();
			if(jsEditor) data.js = jsEditor.getValue();			
			setTimeout(function () {
				socket.emit('livecode', data);
				renderPreview(data);				
			}, 300);		
		});
	}

	function createJsEditor () {
		jsEditor = CodeMirror.fromTextArea(jsTextArea, {
			lineNumbers:true,
			mode: 'js',		
		});

		jsEditor.on("change", function() {  		
			var data = {
				js: jsEditor.getValue(),
			};
			if(htmlEditor) data.html = htmlEditor.getValue();
			if(cssEditor) data.css = cssEditor.getValue();			
			setTimeout(function () {
				socket.emit('livecode', data);
				renderPreview(data);
			}, 300);	
		});
	}

	function renderPreview(data) {			
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

	if($(window).width()>991){
		createCssEditor();
		createJsEditor();	
	}

		
	var tabs = $('.nav-tabs').children();

	tabs.on('click', function (){
		var tab = $(this).text().toLowerCase().trim();

		if(tab==='css' && !cssEditor){
			setTimeout(createCssEditor, 5);								
		}

		if(tab==='js' && !jsEditor){
			setTimeout(createJsEditor, 5);								
		}		
	});

	$(window).on('resize', function () {
		var previewIframe = $('#preview');
		
		if($(window).width()<992){
			if(!previewIframe.attr('style')){
				$("#preview").height($("#preview").contents().find("html").height());
			}
			return;
		}		

		if(!cssEditor){
			setTimeout(createCssEditor, 5);								
		}

		if(!jsEditor){
			setTimeout(createJsEditor, 5);								
		}
		
		if(previewIframe.attr('style')){
			previewIframe.removeAttr('style');
		}
	});	
	
  	socket.on('livecode', function (data) {
    	renderPreview(data);
  	});
});