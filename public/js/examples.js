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
});
