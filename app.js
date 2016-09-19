/*Se crean variables para la sincronización de la app entre pc y el celular
para esto se utliza express y soket.io*/
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var ObjMongo= require('./dbo/dbUser');
//var pug = require("pug");
var ejs = require('ejs');
var crypto = require('crypto');
var device = require('express-device');
var session = require('cookie-session');
var helmet = require('helmet');
var cookieParser = require('cookie-parser');
//Se crean las variables para el llamado de los archivos
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);



// id de usuarios
var usernames = {};

//id de rooms
var rooms = [];

router.use(helmet());
router.engine('html', require('ejs').renderFile);
router.set('view engine', 'html');
router.set('views', __dirname + '/views');

router.get('/video', function (req, res)
{
    res.render('indexv.html');
});

function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}
var secret;
var is_mobile;
//Se le indica cual es la carpeta en la cual a lo que se le hace display
//router.use(express.static(path.resolve(__dirname, 'public')));
router.use(express.static(__dirname + '/public'));
var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour
/*router.use(session({
  name: 'png_lesn',
  keys: [secret, 'l3c0d3'],
  cookie: { secure: true,
            httpOnly: true,
            domain: 'poorsync-ctangarife.c9users.io',
            path: '/',
            expires: expiryDate
          }
  })
);*/

router.use(cookieParser());
router.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;
  //console.log(cookie);
  if (cookie === undefined)
  {
    // no: set a new cookie
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('png_lesn',randomNumber, { maxAge: expiryDate, httpOnly: true, secure: true, path: '/',});
    //console.log('cookie created successfully');
    //console.log(res.cookie.cookieName);
  } 
  else
  {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  } 
  next(); // <-- important!
});

router.use(device.capture());
router.get('/', function(req, res){
is_mobile=req.device.type.toUpperCase();
   if(is_mobile!='PHONE'){
     
     res.render('index');
     //res.sendfile(__dirname + '/index.html');
   }else{
      res.render('index');
    // res.sendfile(__dirname + '/index.html');
   }
   
   //res.send("Hi to "+req.device.type.toUpperCase()+" User");
   
  
});


// Inicializa soket.io

io.on('connection', function (socket) {
    ObjMongo.InsertUser(1,true,true,true,true);
   //Genera el codigo de acceso al room
	socket.on('load',function(){
   if(is_mobile!='PHONE')
   {
      secret= randomValueHex(4);
      socket.emit('key',{val: secret});
   }

  });

   // A new client has come online. Check the secret key and 
  // emit a "granted" or "denied" message.Check
	socket.on('login', function(data){

        if (is_mobile!='PHONE')
        {
          var new_room = data.room;
          rooms.push(new_room);
          console.log(rooms);
          data.room = new_room;
         socket.emit('roomcreated',data);
        }
        else
        {
         socket.emit('joinuser',data);
        }
     
		});

     socket.on('adduser', function (data) {
        var username = data.username;
        var room = data.room;

        if (rooms.indexOf(room) != -1) {
            
            socket.room = room;
            usernames[username] = username;
            socket.join(room);
            socket.emit('access', {access:"granted"});
        } else {
            socket.emit('access', {access:"denied"});
        }
    });

  // Metodos para la sincronizacion de video
  socket.on('video-changed-state',function(data){
    var act=data.act;
    var timelapse=data.timelapse;

    if(act==true)
    {
          io.sockets.in(socket.room).emit('play',{timelapse:timelapse,act:'play'     
          });
    }
    else if(act==false)
    {
          io.sockets.in(socket.room).emit('pause',{ timelapse:timelapse,act:'pause'
          });
    }
      
 
  });

	// Clients send the 'slide-changed' message whenever they navigate to a new slide.

	socket.on('slide-changed', function(data){

		// Check the secret key again
   


			// Tell all connected clients to navigate to the new slide
			//console.log(socket.room);
      io.sockets.in(socket.room).emit('navigate',{
      hash: data.hash
      });


	});
});
//Se inicia el servidor con la url que se va a usar en el puerto 3000
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Se inicia la vaina ", addr.address + ":" + addr.port);
  //console.log("Código "+ secret);

});