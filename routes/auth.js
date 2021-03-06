module.exports = function(app, settings) {
  var auth = require('../lib/authenticate');

  // Login
  app.post("/login", function(req, res) {
    auth.verify(req, settings, function(error, email) {
      if(email) {
        res.cookie('rememberme', 'yes', {
          secure: settings.options.secureCookie,
          httpOnly: true
        });
        req.session.email = email;
        req.session.userFont = Math.floor(Math.random() * 8);
        req.session.nickname = 'Anonymous';
      }
      res.redirect('back');
    });
  });

  // Logout
  app.get("/logout", function(req, res) {
    req.session.email = null;
    req.session.userFont = null;
    req.session.nickname = null;
    res.redirect('/');
  });
};
