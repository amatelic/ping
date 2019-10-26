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

### Important 

Module was tested with 12.13.0 version only

