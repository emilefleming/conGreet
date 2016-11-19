(function() {
  'use strict';

  const testQuery = function() {
    event.preventDefault();
  }

  const login = function() {
    console.log('login');
    $.ajax({
      url: "https://api.thetvdb.com/login",
      Auth: {
        "apikey":"6E0899486D4B7405",
      },
      success: function( result ) {
        console.log(result);
      }
    });
  }

  $('form').submit(testQuery);
  $('button[name="login"]').click(login);
})();
