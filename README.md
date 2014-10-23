nodeSettingsManager
===================
Node Settings manager is dual license, MIT and GPLv2 Take your pick as to witch one works best for your project


How it works
===============

There are 3 main parts that will need to be edited to add settings

* settings.json : this is the file where each individual setting is entered, along with the server name ext...
* files.json  : Which files are used by what setting's, which template to use. and what to run befor and after
* templates/   : The actual template used

settings.json
=============
```javascript
{
    "name": "Mic Processing",
    "description": "Mic Processing Settings",
    "settings": {
        "ip_address" : {
            "displayName": "Ip Address",
            "name" : "ip_address",
            "value": "192.168.1.100",
            "type": "string"
        },
        "subnet_mask" :{
            "displayName": "Subnet Mask",
            "name" : "subnet_mask",
            "value": "255.255.255.0",
            "type": "string"
        },
        "gateway" :{
            "displayName": "Gateway",
            "name" : "gateway",
            "value": "192.168.1.1",
            "type": "string"
        }
    }
}
```
* name : The actuall name of the server ( Shows up as a tab in the web interface )
* description : a short description of what the server does
* settings : an object of settings

files.json
=========
```javascript
[
    { 
        "type" : "file" , 
        "name" : "networking",
        "template" : "interfaces" , 
        "file" : "/etc/network/interfaces" , 
        "watch" : ["ip_address" , "subnet_mask" , "gateway"] , 
        "preexec" : [],
        "postexec" : [ { "type" :"bash" , "command" : "/etc/init.d/networking restart" }]
     }
]
```
an array of files,
* name : a unique name for this file
* type : currently only file is supported, but good for expantion
* template : which template to use ( from templates/ )
* file : where to write the file to 
* watch : an array of settings to re-process the file if they are changed
* preexec : an array of commandtype objects to run before editing the file
* postexec : an array of commandtype objects that run after the file is edited
* commandtype.type : currently "bash" is the only supported one
* commandtype.command : what to run


templates/
========
```
# interfaces(5) file used by ifup(8) and ifdown(8)
auto lo
iface lo inet loopback
iface eth0 inet static
address <_ip_address_>
netmask <_subnet_mask_>
gateway <_gateway_>
```
```
 <_gateway_> will be replaced with the value of the setting gateway
```
