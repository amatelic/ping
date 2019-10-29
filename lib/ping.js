#!/usr/bin/env node

const { pipeline, Transform, Readable } = require('stream');
const url = require("url");
const assert = require('assert');
const util = require('util');
const { fetch, streamBuffer } = require('./util')
const pipelinep = util.promisify(pipeline);

// [IMPORTANT] if running multiple times convert to 
// function because the stream is otherwise reused
// https://stackoverflow.com/questions/32274103/node-js-sharp-library-write-after-end-error
const fetchPipe = () => new Transform({
    async transform(chunk, encoding, callback) {
        try {

            const inputUrl = chunk.toString();

            if(!url.parse(inputUrl).hostname) {
                throw new Error(`String ${inputUrl.replace(/(\r\n|\n|\r)/gm, "")} is not a valid url`);
            }

            const response = await fetch(inputUrl);
            callback(null, JSON.stringify(response));
        } catch (error) {
            callback(error);
        }
    }
  });

// Fix problem with numbers,objects
function convertGuard(value) {
    if (Buffer.isBuffer(value) || typeof value === 'string') {
        return new Readable({
            read(size) {
                this.push(value);
                this.push(null);
            }
        });
    }

    return value
}


function ping(readStream, writeStream, wasRequired = false) {

    assert.ok(readStream, 'Read stream is missing');
    assert.ok(writeStream, 'Write stream is missing');

    const newReadStream = convertGuard(readStream);

    return new Promise((resolve, _) => {
        if (wasRequired) {
            return pipelinep(readStream, fetchPipe(), writeStream);
        } else {
            return streamBuffer(newReadStream.pipe(fetchPipe())).then(resolve);
        }

    })
}


module.exports = {
    ping
}
