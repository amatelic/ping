# Ping

Basic module for retriving basic headers from websites.
Right now support usage as module and as linux pipe.

## Example of usage with unix pipes

```sh
echo "http://gdo-studio.si" | ./index.js | jq
```

## Example with module supports (Buffer|String|Stream)

```js
const { ping } = require('ping');

ping('http://gdo-studio.si')
    .then(data => console.log(data))
    .then(err => consoel.log(err));
```



##  Basic connection steps for http/https connection:

### Whole client to server interaction:

-   DNS Lookup
-   TCP Connection
-   TLS Handshake
-   Time to First Byte
-   Content Byte 


### Connection established part: 

- DNS Lookup
- TCP Connection
- TLS Handshake


### Request and Response:

- Time to First Byte
- Content Transfer
    

## Tracking handshakes

- [Measuring http timing node js]https://blog.risingstack.com/measuring-http-timings-node-js/


## Notes

Module was tested with 12.13.0 version only

