#!/usr/bin/env node
const { ping } = require('./lib/ping');
const { PassThrough } = require('stream');

if (require.main === module) {
    (async function () {
        return await ping(process.stdin, process.stdout, require.main === module);
    })();
} else {
    module.exports = {
        ping: (stream) => ping(stream, new PassThrough())
    }
}