$(function () {
	var htmlEditor, cssEditor, jsEditor;

	createHtmlEditor();
	renderPreview();

	function createHtmlEditor () {
		htmlEditor = CodeMirror.fromTextArea(htmlTextArea, {
			lineNumbers:true,
			mode: 'htmlmixed',
		});

		htmlEditor.on("change", function() {  		
			setTimeout(renderPreview, 300);		
		});
	}

	function createCssEditor () {
		cssEditor = CodeMirror.fromTextArea(cssTextArea, {
			lineNumbers:true,
			mode: 'css',		
		});

		cssEditor.on("change", function() {  		
			setTimeout(renderPreview, 300);		
		});
	}

	function createJsEditor () {
		jsEditor = CodeMirror.fromTextArea(jsTextArea, {
			lineNumbers:true,
			mode: 'js',		
		});

		jsEditor.on("change", function() {  		
			setTimeout(renderPreview, 300);		
		});
	}

	function renderPreview() {							
		var previewFrame = document.getElementById('preview');
		var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;		
		preview.open();

		if(cssEditor){
			preview.write('<style type="text/css">' + cssEditor.getValue() + '</style>'); 
		}
		preview.write(htmlEditor.getValue());		
		if(jsEditor){
			preview.write('<script>' + jsEditor.getValue() + '</script>');
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
});