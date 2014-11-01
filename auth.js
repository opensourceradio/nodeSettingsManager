module.exports = {
    Users : null,
    crypto : null,
    counter : 0,
    sha256 : function( data ){
        var self = this;
        return self.crypto.createHash('sha256').update(data).digest('hex');
    },
    init : function( Store ){
        var self = this;
        self.crypto = require('crypto');
        self.Users = Store('users');
    },
    updateChallange : function( username ){
        self = this;
        if( self.Users !== null ){
            var user = self.Users.get(username);
            self.counter++;
            user.challange = self.sha256( Math.random() + 'x' + Math.random() + new Date().getTime() + "Y" + self.counter );
            self.Users.set( username , user );
            return user.challange;
        } else {
            return false;
        }
    },
    onConnect : function( socket ){
        var self = this;
        socket.loggedIn = false;
        socket.on( 'verifyAuth' , function(userInfo){
            var username = userInfo.username;
            var authValid = false;
            var user = self.Users.get(username);
            if( user !== undefined ){
                var chkHash = self.sha256( user.hash + '' + user.challange);
                self.updateChallange( username );
                if( chkHash == userInfo.hash ){
                    authValid = true;
                    socket.loggedIn = true;
                    socket.username = username;
                    socket.emit('loginSuccessful' , { username : username , displayName : user.displayName } );
                }
            }
            if( authValid === false ){
                setTimeout( function(){
                    socket.emit('loginFailed' , { 'error' : 'Invalid Username or Password'});
                } , Math.ceil(  Math.random() * 100 ) );
            }
        });
        socket.on('checkAuth' , function( username ){
            var user = self.Users.get(username);
            if( user !== undefined ){
                socket.emit('challangeAuth' , self.updateChallange(username) );
            } else {
                socket.emit('challangeAuth' , self.sha256( username + Math.random() + '' + username ) );
            }
        });
    },
    createUser : function(){
        
    }
}
