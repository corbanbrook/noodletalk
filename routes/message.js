module.exports = function(app) {
  var message = {};
  var gravatar = require('gravatar');
  var content = require('../lib/web-remix');
  var io = require('socket.io').listen(app);

  // Only using long-polling for now because heroku hates websockets
  io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });

  var getMessage = function(req) {
    if(req.body) {
      var datetime = new Date();
      var oldNickname = req.session.nickname;
      var nickname = content.getNickName(req.body.message);
      var message = content.generate(req.body.message);
      var isAction = false;

      if(nickname.length > 0) {
        req.session.nickname = nickname;
        message = '<em>' + oldNickname + ' has changed to ' + nickname + '</em>';
        isAction = true;
      }

      if(!req.session.nickname) {
        req.session.nickname = 'Anonymous';
      } 

      // if this is a /me prepend with the nick
      var meMatch = /^(\s\/me\s)/i;

      if(message.match(meMatch)) {
        message = '<em>' + req.session.nickname + ' ' + message.replace(meMatch, '') + '</em>';
        isAction = true;
      }

      message = {
        nickname: req.session.nickname,
        message: message,
        gravatar: gravatar.url(req.session.email),
        font: req.session.userFont,
        hours: datetime.getHours(),
        mins: datetime.getMinutes(),
        secs: datetime.getSeconds(),
        raw_time: datetime.getTime(),
        server_timezone: datetime.getTimezoneOffset() / 60,
        created: new Date().getTime(),
        connected_clients: io.sockets.clients().length,
        is_action: isAction
      };

      return message;
    }
  };

  // Add new message
  app.post("/message", function(req, res) {
    var message = getMessage(req);
    
    io.sockets.emit('message', message);
    res.json(message);
  });
};
