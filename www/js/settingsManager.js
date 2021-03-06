var Setting = function(data){
    if( data.value === undefined ){ data.value = ""; }
    var self = this;
    self.name = ko.observable( typeof data.name == "string" ? data.name : '' );
    self.value = ko.observable(  String( data.value ) );
    self.type = ko.observable( typeof data.type == "string" ? data.type : '' );
    self.original = ko.observable(   String( data.value ) );
    self.changed = ko.observable(false);
    self.syncData = function( newData ){
        if( self.changed() == false ){
            self.original( String( newData.value ) );
            self.value( String( newData.value ) );
        }
    }
    self.original.subscribe(
        function(){
            console.log(self.value() );
            if( self.value() != self.original() ){
                if( self.changed() == false ){
                    settingsManager.changes(settingsManager.changes() + 1 );
                }
                self.changed(true);
            } else {
                if( self.changed() == true ){
                    settingsManager.changes(settingsManager.changes() - 1 );
                }
                self.changed(false);
            }
        }  );
    self.value.subscribe(
        function(){
            console.log(self.value() );
            if( self.value() != self.original() ){
                if( self.changed() == false ){
                    settingsManager.changes(settingsManager.changes() + 1 );
                }
                self.changed(true);
            } else {
                if( self.changed() == true ){
                    settingsManager.changes(settingsManager.changes() - 1 );
                }
                self.changed(false);
            }
        }    
    );
}
var Server = function(data){
    if( typeof data.settings == "undefined" ){
        data.settings = [];
    }
    var self = this;
    self.name = ko.observable(data.name);
    self.active = ko.observable( data.active == true ? true : false );
    self.description = ko.observable('');
    if( data.hasOwnProperty( 'description' ) ){
        self.description( data.description  );
    }
    self.onSelect = function(){
        ko.utils.arrayForEach(settingsManager.servers(), function (server) {
            //For efficency, I dont wan't subscribers to active to get hit if there will be no change
            if( server.active() === true ){ server.active(false); }
        });
        self.active( true );
    }
    self.settings = ko.observableArray( [] );
    $.each( data.settings , function(key,val){
        self.settings.push( new Setting( val ) );
    });
    self.syncData = function(newData){
        $.each( newData , function( key , value ){
            if( key == "settings"){
                console.log( value );
                $.each( value , function(key,newSetting){
                    var match = ko.utils.arrayFirst(self.settings(), function(setting) {
                        return setting.name() === newSetting.name;
                    });
                    console.log( match );
                    if (!match) {
                      self.settings.push(new Setting(newSetting));
                    } else {
                        match.syncData( newSetting );
                    } 
                });
            } else {
                if( self.hasOwnProperty(key)){
                    if( self[key]() !== value ){
                        self[key](value);
                    }
                }
            }
        });
    }
}

var settingsManager = {
    servers : ko.observableArray([]),
    saveChanges : function(){
        var changes = [];
        ko.utils.arrayForEach(settingsManager.servers(), function (server) {
           ko.utils.arrayForEach(server.settings(), function (setting) {
               if( setting.changed() === true ){
                   changes.push({ server : server.name() , name : setting.name() , value : setting.value() } );
                   setting.original( setting.value() );
               } 
           } );
        });
        socket.emit('save' , changes );
    },
    syncServerData : function( data ){
        var match = ko.utils.arrayFirst(settingsManager.servers(), function(server) {
            return server.name() === data.name;
        });
        if (!match) {
          settingsManager.servers.push(new Server(data));
        } else {
            match.syncData( data );
        }
    },
    user : {
        loggedIn : ko.observable(false),
        login : function(){
            var self = settingsManager.user;
            //Get the hash of the username and the password ( The server stores this hash as well )
            //Salt based on username
            self.baseHash( CryptoJS.SHA256(  self.username() + '' +  self.password()  ).toString() );
            self.password(''); // Clear the password it is no loner needed
            socket.emit('checkAuth' , self.username() );
        },
        sendLogin : function(challange){
            var self = settingsManager.user;
            //Hash this with the challenge to create a token that is unique to prevent playback attacks
            var authHash = CryptoJS.SHA256(  self.baseHash() + '' + challange ).toString();
            socket.emit( 'verifyAuth' , { hash : authHash , username : self.username() } );
        },
        
        'username' : ko.observable(''),
        'password' : ko.observable(''),
        'baseHash' : ko.observable(''),
        'displayName' : ko.observable('')
    },
    changes : ko.observable(0)
}
socket.on('challangeAuth' , function( challange ){
    settingsManager.user.sendLogin(challange);
});
socket.on('loginSuccessful' , function(userInfo){
    settingsManager.user.displayName(userInfo.displayName);
    settingsManager.user.loggedIn(true);
});
ko.applyBindings( settingsManager );