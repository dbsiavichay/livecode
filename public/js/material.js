$(function () {
  $('.btn-danger').on('click', function () {
    var buttonPressed = $(this);
    var id = buttonPressed.parent().siblings('.list-group-item').attr('id');
    $.ajax({
      url: '/examples/'+id,
      type: 'DELETE',
      success: function(result) {
        if(result.success) {
          var row = buttonPressed.parents('.row');
          row.slideUp('normal', function () {
            row.remove();
          })
        }
      }
    });
  });
  
  $('#btnAdd').on('click', function () {
  	$('.add-form').slideDown();
  });

  $('#btnSave').on('click', function (event) {
		event.preventDefault();
		var description = $('#txtName').val();
		var link = $('#txtLink').val();
		
		$.post('/material', {name: description, link: link}, function (err) {
			if(err) {
				console.log(err);
				return;
			}
			
			$(location).attr('href', '/material');
		});		
	});  
});