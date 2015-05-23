$(function () {
	var htmlEditor, cssEditor, jsEditor;	
	var data = {};
	var socket = io.connect(window.location.href);	

	createHtmlEditor();
	data.html = htmlEditor.getValue();
	renderPreview();	

	function createHtmlEditor () {
		if(!htmlEditor){
			htmlEditor = CodeMirror.fromTextArea(htmlTextArea, {
				lineNumbers:true,
				mode: 'htmlmixed',
			});				

			htmlEditor.on("change", function (editor, event) { 						
				data.html = htmlEditor.getValue();			
				if(event.origin != 'setValue') {
					socket.emit('livecode', {html: data.html});	
					setTimeout(renderPreview, 300); 
				}				
			});	
		}
		
		if(data.html!=undefined) htmlEditor.setValue(data.html);
	}

	function createCssEditor () {
		if(!cssEditor){			
			cssEditor = CodeMirror.fromTextArea(cssTextArea, {
				lineNumbers:true,
				mode: 'css',		
			});

			cssEditor.on("change", function (editor, event) {  		
				data.css = cssEditor.getValue();
				if(event.origin != 'setValue') {
					socket.emit('livecode', {css: data.css});	
					setTimeout(renderPreview, 300);
				}				
			});
		}

		if(data.css!=undefined) cssEditor.setValue(data.css);		
	}

	function createJsEditor () {
		if(!jsEditor){
			jsEditor = CodeMirror.fromTextArea(jsTextArea, {
				lineNumbers:true,
				mode: 'js',		
			});

			jsEditor.on("change", function (editor, event) {  		
				data.js = jsEditor.getValue();
				if(event.origin != 'setValue') {
					socket.emit('livecode', {js: data.js});	
					setTimeout(renderPreview, 300);
				}
				
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
	
  	socket.on('livecode', function (_data) {   		
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
  		renderPreview();  		
  	});
});