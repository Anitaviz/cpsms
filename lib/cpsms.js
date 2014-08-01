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
/**
 * sends an sms to using the gateway
 * @param {(String|String[])} recipient Either a sting or an array of strings containing the mobile numbers of the recipients the number must include a language code
 * @param {String} message The message to send to the recipient(s)
 * @param {String} from The number or name the sms should appear to be from
 * @param {Object} options the following options are avaiable:
 * @param {String} options.url An url the api should call when status for an sms changes (delivered, aborted, failed, queued, etc.)
 * @param {String} options.timestamp a timestamp for when the smsm should be delivered in the form of 'YYYYMMDDHHMM'
 * @param {number} [options.utf8=1] if the from and message strings should be utf8 encoded
 * @param {number} [options.flash=0] if the sms should be shown as a flash message (popup message on the phone)
 * @event end Fires when the call to the cpsms api have returned all data returned from the api is returned
 * @event finish Fires when the sms was sent to the api and the api returns a success message
 * @event error Fires when an error occurs, either from an error message from the api or an internal node error
 * @returns {EventEmitter}
 */
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
            var err = responseData.match(/<error>([^<]*)<\/error>/);
            if(err){
                emitter.emit('error',err[1]);
            }
            // Yes the api returns succes and not success
            var success = responseData.match(/<succes>([^<]*)<\/succes>/);
            if(success){
                emitter.emit('finish',success[1]);
            }
            emitter.emit('end',responseData);
        });
    }).on('error',function(e){
        emitter.emit('error',e);
    }).end();
    return emitter;
}
module.exports = Cpsms;


