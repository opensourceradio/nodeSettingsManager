var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ioClient = require('socket.io-client');
app.use(express.static(__dirname + '/www' ) );
var settings = require('./settings.js');
settings.readFiles();
io.on('connection' , function(socket){
    socket.on( 'save' , function( data ){
        settings.save( data );
        
    });
    socket.emit('settings' , settings.data );
});

setTimeout( function(){ settings.saveFile( 'interfaces' , 'file' ); } , 1000 );
server.listen(8080);
