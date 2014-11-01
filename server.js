var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ioClient = require('socket.io-client');
app.use(express.static(__dirname + '/www' ) );
var settings = require('./settings.js');
var crypto = require('crypto');
function sha256( data ){
	return crypto.createHash('sha256').update(data).digest('hex');
}
// create our db
var Store = require('ministore')('db');
settings.readFiles();

var Support = require('./support.js');
Support.init();

var Auth = require('./auth.js');
Auth.init( Store );

io.on('connection' , function(socket){
    Auth.onConnect( socket );
    Support.onConnect( socket );
    socket.username = '';
    socket.on( 'save' , function( data ){
        if( socket.loggedIn === true ){
            settings.save( data );
        }
        
    });
    socket.emit('settings' , settings.data );
    
});

setTimeout( function(){ settings.saveFile( 'interfaces' , 'file' ); } , 1000 );
server.listen(8080);
