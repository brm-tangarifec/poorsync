/*Se crean variables para la sincronización de la app entre pc y el celular
para esto se utliza express y soket.io*/
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var mongoose = require('mongoose');
var pug = require("pug");
var crypto = require('crypto');
var device = require('express-device');

//Se crean las variables para el llamado de los archivos
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

var db = mongoose.connection;


router.set('view engine', 'pug');
router.set('views', __dirname + '/views');


function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}

//Se le indica cual es la carpeta en la cual a lo que se le hace display
//router.use(express.static(path.resolve(__dirname, 'public')));

router.use(express.static(__dirname + '/public'));

router.use(device.capture());
router.get('/', function(req, res){
  var is_mobile=req.device.type.toUpperCase();
   if(is_mobile!='PHONE'){
     res.render('index', {val: secret});
     //res.sendfile(__dirname + '/index.html');
   }else{
      res.render('index');
    // res.sendfile(__dirname + '/index.html');
   }
   
   //res.send("Hi to "+req.device.type.toUpperCase()+" User");
   
  
});
// Se crea el key para sincronizar



var secret = randomValueHex(4);

// Inicializa soket.io

var presentation = io.on('connection', function (socket) {
    
    // A new client has come online. Check the secret key and 
	// emit a "granted" or "denied" message.Check
	
	socket.on('load', function(data){
		
		socket.emit('access', {
			access: (data.key === secret ? "granted" : "denied")
		});

	});
	
	// Clients send the 'slide-changed' message whenever they navigate to a new slide.

	socket.on('slide-changed', function(data){

		// Check the secret key again

		if(data.key === secret) {

			// Tell all connected clients to navigate to the new slide
			
			presentation.emit('navigate', {
				hash: data.hash
			});
		}

	});

    
  });
  


//Se inicia el servidor con la url que se va a usar en el puerto 3000
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Se inicia la vaina ", addr.address + ":" + addr.port);
  console.log("Código "+ secret);


  
});