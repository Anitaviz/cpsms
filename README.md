cpsms
=====

Node module to use cpsms.dk gateway easily



Example
=====
```js
var smsApi = require('cpsms');
var sender = new smsApi('username','password');

sender
    .sendSMS('+4599999999','Hi this is a message from cpsms','Me')
    .on('end',function(message){
        console.log('Api returned: ', message);
    })
    .on('finish',function(message){
        console.log('SMS sent: ', message);
    })
    .on('error',function(message){
        console.log('An error occured: ', message);
    })

```
