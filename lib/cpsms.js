var https = require('https');
var url = require('url');
var EventEmitter = require('events').EventEmitter;

var optionalParameters = {
    url: null,
    timestamp: null,
    utf8: 1,
    flash: 0
};

/**
 * Constructor for the cpsms module
 *
 * @example
 *     var gateway = require('cpsms');
 *     var sender = new gateway("username","password")
 * 
 * @param {String} user Your username for the cpsms gateway
 * @param {String} pass Your password for the cpsms gateway
 * @return {Cpsms}
 */

var Cpsms = function(username, password) {
    this.username = username;
    this.password = password;
}

Cpsms.prototype.sendSMS = function(recipient, message, from, options) {
    var emitter = new EventEmitter();
    //console.log(emitter);
    var responseData = '';
    
    if (!options) {
        options = {};
    }
    var urlObject = {
        protocol: 'https',
        host: 'www.cpsms.dk',
        pathname: 'sms/',
        query: {
            username: this.username,
            password: this.password,
            message: message,
            from: from
        }
    };
    if (Array.isArray(recipient)) {
        urlObject.query['recipient[]'] = recipient;
    } else {
        urlObject.query['recipient'] = recipient;
    }
    for (option in optionalParameters) {
        if (options[option]) {
            urlObject.query[option] = options[option];
        } else if (optionalParameters[option]) {
            urlObject.query[option] = optionalParameters[option];
        }
    }

    var uri = url.format(urlObject);
    https.get(uri,function(response){
        response.on('data',function(chunk){
            responseData += chunk;
        });
        response.on('end',function(){
            emitter.emit('end',responseData);
        });
    }).on('error',function(e){
        emitter.emit('error',e);
    }).end();
    return emitter;
}
//util.inherits(Cpsms, EventEmitter);
module.exports = Cpsms;


