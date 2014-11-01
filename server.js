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

var Auth = require('./auth.js');
Auth.init( Store );

var users = {
    'admin' : { 
        'hash' :'749f09bade8aca755660eeb17792da880218d4fbdc4e25fbec279d7fe9f65d70' , 
        'challange' :  sha256( Math.random() + 'x' + Math.random() + new Date().getTime() ),
        'displayName' : 'Admin User'
    }
};
var test = { 'a' : { tmpChallange : sha256( Math.random() + 'x' + Math.random() + new Date().getTime() ) }};

io.on('connection' , function(socket){
    Auth.onConnect( socket );
    
    socket.username = '';
    socket.on( 'save' , function( data ){
        settings.save( data );
        
    });
    socket.emit('settings' , settings.data );
    
});

setTimeout( function(){ settings.saveFile( 'interfaces' , 'file' ); } , 1000 );
server.listen(8080);
