/**
   If you are setting up your system, you are likely looking for settings.json
**/

module.exports = {
    onObj : {},
    replaceAll : function( str , str1, str2, ignore ) 
    {
        console.log( typeof str );
        return str.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
    } ,
    currentRun : [],
    on : function( setting , func ){
        var self = this;
        if( self.onObj.hasOwnProperty( setting ) === false ){
            self.onObj[setting] = [];
        }
        self.onObj[setting].push( func );
    } , 
    execOn : function( setting ){
        var self = this;
        if( self.onObj.hasOwnProperty( setting ) !== false ){
            for( var s in self.onObj[setting] ){
                switch( typeof self.onObj[setting][s] ){
                    case "function":
                        self.onObj[setting][s]();
                    break;
                }
            }
        }
    },
    data : {},
    files : {},
    save : function( settings ){
        var self = this;
        var changed = [];
        for( var s in settings ){
            var setting = settings[s];
            if( setting.server == self.data.name && self.data.settings.hasOwnProperty(setting.name) ){
                self.data.settings[setting.name].value = setting.value;
                changed.push( setting.name );
            }
        }
        for( var c in changed ){
            self.execOn( changed[c]);
        }
    },
    runBash : function( cmd ){
        var sys = require('sys')
        var exec = require('child_process').exec;
        function puts(error, stdout, stderr) { sys.puts(stdout) }
        exec(cmd, puts);
    },
    saveFile : function( template , file ){
        var self = this;
        var fs = require('fs');
        fs.readFile( 'templates/' + template , 'utf8' , function( err,data ){
            for( var o in self.data.settings ){
                var setting = self.data.settings[o];
                data = self.replaceAll( data , "<_" + setting.name + "_>" , setting.value );
            }
            fs.writeFile( file, data, function(err) {
                if(err) {
                    console.log(err);
                } 
            }); 
        });
    },
    ran : [],
    oncePerRun : function( name , callback ){
        var self = this;
        if( self.ran.indexOf(name) === -1 ){
            self.ran.push(name);
            callback();
        }
    },
    readFiles : function(){
        var self = this;
        var fs = require('fs');
        fs.readFile('settings.json','utf8', function (err, data) {
          if (err) throw err;
          self.data =  JSON.parse( data );
        });
        fs.readFile( 'files.json' , 'utf8' , function( err , data ){
            self.files =  JSON.parse( data );
            for ( var f in self.files ){
                var file = self.files[f];
                switch( file.type ){
                    case "file":
                        var func = function(){
                            self.oncePerRun( file.name , function(){
                                if( file.hasOwnProperty( "preexec" ) === true ){
                                    for( var pe in file.preexec ){
                                        var pre = file.preexec[pe];
                                        if( pre.type == "bash"){
                                            self.runBash( pre.command );
                                        }   
                                    }
                                }
                                if( file.hasOwnProperty( "template" ) === true && file.hasOwnProperty( "file" ) === true ){
                                    self.saveFile( file.template , file.file );
                                }
                                if( file.hasOwnProperty( "postexec" ) === true ){
                                    for( var po in file.postexec ){
                                        var post = file.postexec[po];
                                        if( post.type == "bash"){
                                            self.runBash( post.command );
                                        }   
                                    }
                                }
                            });
                        }
                        for( var f in file.watch ){
                            self.on(file.watch[f] , func );
                        }
                    break;
                }
            }
        });
    }
}
