$(function () {
  $('#btnLogin').on('click', function () {
    var username = $('#inputCedula').val();
    var password = $('#inputPassword').val();

    var formu = $('#inputCedula').parents('.form-group');
    var formp = $('#inputPassword').parents('.form-group');

    if(!username && !password) {
      formu.addClass('has-error');
      formp.addClass('has-error'); 
      return;
    }else if(!username ) {
      formu.addClass('has-error');
      formp.removeClass('has-error');
      return;
    }else if(!password) {      
      formu.removeClass('has-error');
      formp.addClass('has-error'); 
      return;
    }

    $.ajax({
      url: 'https://puentewebservice.herokuapp.com/',
      type: 'POST',
      data: {
        username: username,
        password: password
      },
      success: function (result) {    
        $.post('/login', result, function (data) {
          window.location.href = "/";
        });
      },
      error: function (err) {
        formu.addClass('has-error');
        formp.addClass('has-error');        
      }
    });
  });
});
