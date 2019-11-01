# Ping


Basic module for retriving basic headers from websites.
Right now support usage as module and as pipe.

// Example of usage with unix pipes

```
echo "http://gdo-studio.si" | ./index.js | jq
```

// Example with module supports (Buffer|String|Stream)

```
const { ping } = require('ping');

ping('http://gdo-studio.si')
    .then(data => console.log(data))
    .then(err => consoel.log(err));
```

### Important(should be fixed problem stream)

Module was tested with 12.13.0 version only

### Basic module for  retriving more information related 

|DNS Lookup| -> | |TCP Connection| - | TLS Handshake| | -> | Time to First Byte| -> | Content Byte | 


Connection established 

    - TCP Connection
    - TLS Handshake


Request and Response 
    - Time to First Byte
    - Content Transfer
    

### Tracking handshakes
    - [Measuring http timing node js]https://blog.risingstack.com/measuring-http-timings-node-js/

