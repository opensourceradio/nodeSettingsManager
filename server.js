var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ioClient = require('socket.io-client');
app.use(express.static(__dirname + '/www' ) );
var settings = 
{
    name : 'Mic Processing' , 
    description : 'Mic Processing Settings',
    settings: [
        { name : 'Ip Address' , value : '192.168.1.100' , type : 'string' },
        { name : 'Subnet Mask' , value : '255.255.255.0'  , type : 'string' },
        { name : 'Gateway' , value : '192.168.1.1'  , type : 'string' },
    ]
};
io.on('connection' , function(socket){
    socket.on( 'save' , function( data ){ 
        console.log( data );
    });
    socket.emit('settings' , settings );
});


server.listen(8080);