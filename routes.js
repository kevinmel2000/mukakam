var express = require('express');
var router = express();
const session = require('express-session');
const db = require('./queries')
const Pusher     = require('pusher');

const pusher = new Pusher({
  appId:     process.env.PUSHER_APP_ID,
  key:       process.env.PUSHER_APP_KEY,
  secret:    process.env.PUSHER_APP_SECRET,
  cluster:   process.env.PUSHER_APP_CLUSTER
});


router.use(session({
    secret: 'hubla',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

router.get('/',(request, response) => {
    if (request.session.loggedin) {
        response.redirect('/home');
    } else {
      response.render('login',{username:null,roomID:null})
    }
    
  });
  
  router.post('/', db.cekUser);
  
  router.get('/register', function(request, response) {
      response.render('register');
  });
  router.post('/register', db.createUser)
  
  
  router.get('/home', function(request, response) {
    //response.send(request.session)
    if (request.session.loggedin) {
      response.render('home',{username:request.session.username});
    } else {
      response.redirect('/');
    }
      
  });
  
  router.get('/broadcast', function(request, response) {
      if (request.session.loggedin) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 5; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        let roomID = result;
        request.session.roomID = roomID;
        var scripts = [{script:'/socket.io/socket.io.js'},{ script: '/broadcast.js' }];
        response.render('broadcast',{scripts:scripts,roomID:roomID,username:request.session.username});
      } else {
        response.redirect('/');
      }
  });
  
  router.get('/watch', function(request, response) {
      if (request.session.loggedin) {
        var scripts = [{script:'/socket.io/socket.io.js'},{ script: '/watch.js' }];
        response.render('watch',{scripts:scripts,username:request.session.username});
    } else {
      response.redirect('/');
    }
  });



  router.post('/pusher/auth', (req, res) => {
      const socketId = req.body.socket_id;
      const channel = req.body.channel_name;
      // Retrieve username from session and use as presence channel user_id
      const presenceData = {
          user_id: req.session.username
      };
      const auth = pusher.authenticate(socketId, channel, presenceData);
      res.send(auth);
  }); 

  router.get('/send-message', (req, res) => {
      pusher.trigger(req.query.roomID, 'message_sent', {
          username: req.query.username,
          message:  req.query.message
      });
      res.send('Message sent');
  });

  router.post('/logout', function(request, response) {
    request.session.loggedin = false;
    request.session.username = null;
    request.session.userID = null;
    response.redirect('/');
  });
  
  router.use(function(request, response,next) {
      response.locals.session = request.session;
      next();
  });

  


module.exports = router;