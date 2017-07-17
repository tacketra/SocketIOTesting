var app = require('express')();
var fs = require('fs');

var http = require('https').Server(
  {
    pfx: fs.readFileSync('..\\Certificates\\cert.pfx'),
    passphrase: fs.readFileSync('..\\Certificates\\phrase.tlz')
  },
  app);

var io = require('socket.io')(http);
var port = process.env.PORT || 2525;

app.get('/', function(req, res){
  console.log('just logged in');
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    var message = socket.username + ': ' + msg;
    io.emit('chat message', message);
  });

  socket.on("set_name", function (data) {
    var usernameToUse = data.name;
    console.log("set_name in index.js called, trying to use: " + usernameToUse);
    var validName = true;
    for (var socketId in io.sockets.sockets)
    {
      if (io.sockets.sockets[socketId].username == usernameToUse)
      {
        console.log("That name already exists: " + io.sockets.sockets[socketId].username + ", new name: " + usernameToUse);
        validName = false;
      }
    }

    if (validName)
    {
      socket.username = data.name;
      console.log('username: ' + data.name);
    }
    else
    {
        console.log('invalid name');
        socket.emit("try_name");
    }

  });
});


// socket.on("set_name", function (data) {
//     socket.username = data.name;

//     socket.emit("name_set", data);
//     socket.emit("message", {
//         type    :"serverMessage",
//         message :"Welcome!" 
//     });
//     chat.emit("message", {
//         type    :"serverMessage",
//         message : data.name + " has joined the room.!"
//     });
// });

http.listen(port, function(){
  console.log('listening on *:' + port);
});
