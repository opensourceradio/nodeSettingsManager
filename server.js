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
settings.readFiles();
//
var users = {
    'admin' : { 
        'hash' :'749f09bade8aca755660eeb17792da880218d4fbdc4e25fbec279d7fe9f65d70' , 
        'challange' :  sha256( Math.random() + 'x' + Math.random() + new Date().getTime() ),
        'displayName' : 'Admin User'
    }
};
var test = { 'a' : { tmpChallange : sha256( Math.random() + 'x' + Math.random() + new Date().getTime() ) }};

io.on('connection' , function(socket){
    socket.loggedIn = false;
    socket.username = '';
    socket.on( 'save' , function( data ){
        settings.save( data );
        
    });
    socket.emit('settings' , settings.data );
    socket.on('verifyAuth' , function( userInfo ){
        console.log( userInfo );
        var username = userInfo.username;
        var authValid = false;
        if( users.hasOwnProperty( username ) ){
            //users[username].challange = sha256( Math.random() + 'x' + Math.random() + new Date().getTime() );
            var chkHash = sha256( users[username].hash + '' + users[username].challange);
            users[username].challange = sha256( Math.random() + 'x' + Math.random() + new Date().getTime() );
            if( chkHash == userInfo.hash ){
                authValid = true;
                socket.loggedIn = true;
                socket.username = username;
                 socket.emit('loginSuccessful' , { username : username , displayName : users[username].displayName } );
            }
        } 
        if( authValid === false ){
            setTimeout( function(){
                socket.emit('loginFailed' , { 'error' : 'Invalid Username or Password'});
            } , Math.ceil(  Math.random() * 100 ) );
        }
    });
    socket.on('checkAuth' , function( username ){
        console.log( username );
        if( users.hasOwnProperty( username ) ){
                users[username].challange = sha256( Math.random() + 'x' + Math.random() + new Date().getTime() );
                socket.emit('challangeAuth' , users[username].challange );
        } else {
                test['a'].tmpChallange = sha256( Math.random() + 'x' + Math.random() + new Date().getTime() );
                socket.emit('challangeAuth' , test['a'].tmpChallang );
        }
    });
});

setTimeout( function(){ settings.saveFile( 'interfaces' , 'file' ); } , 1000 );
server.listen(8080);
