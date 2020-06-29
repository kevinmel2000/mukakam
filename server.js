require('dotenv').config();
const path = require('path');
const express = require("express");
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const routes = require('./routes');
const flash = require('connect-flash');
app.use(flash());

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(routes)

var hbs = handlebars.create({
	defaultLayout: 'main', 
	extname: '.hbs',
    helpers: {
        isExist: function (v1, options) { 
			if(v1 === undefined) {
				return options.fn(this);
			}
			return options.inverse(this);
		 }
    }
});

app.engine('.hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

let broadcaster;
const port = 4000;

const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

const myPath = __dirname + "/public";
app.use(express.static(myPath));


io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  let roomID;
  if(typeof socket.handshake.query.roomID != "undefined"){
    roomID = "room "+socket.handshake.query.roomID
  }

  let roomName = roomID;
  socket.join(roomName, () => {
    let rooms = Object.keys(socket.rooms);
    console.log(rooms); // [ <socket.id>, 'room 237' ]
  });
  
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    io.sockets.in(roomName).emit('broadcaster',roomID);
    //socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    io.sockets.in(roomName).emit('watcher',socket.id,roomID);
    //socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    io.sockets.in(roomName).emit('offer',socket.id,message,roomID);
    //socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    io.sockets.in(roomName).emit('answer',socket.id,message,roomID);
    //socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    io.sockets.in(roomName).emit('candidate',socket.id,message,roomID);
    //socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("bye", () => {
    io.sockets.in(roomName).emit('disconnectPeer',socket.id,roomID);
    //socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});


server.listen(port, () => console.log(`Server is running on port ${port}`));



