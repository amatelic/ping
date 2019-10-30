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

### Tracking handshakes
    - [Measuring http timing node js]https://blog.risingstack.com/measuring-http-timings-node-js/

