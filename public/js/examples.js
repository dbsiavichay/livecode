$(function () {
  $('.btn-danger').on('click', function () {
    var buttonPressed = $(this);
    var id = buttonPressed.attr('id');
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

  $('.list-group-item').on('click', function (event) {
    event.preventDefault();
    var item = $(this).siblings()[1];
    var id = $(item).children().attr('id');
    $.post('/loadexample', {id: id}, function (data) {
      if(data) window.location.href = '/';
      else window.location.href = '/examples';
    });
  });
});
