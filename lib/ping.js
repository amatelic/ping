#!/usr/bin/env node

const { pipeline, Transform, Readable } = require('stream');
const url = require("url");
const http = require('http');
const assert = require('assert');
const util = require('util');
const pipelinep = util.promisify(pipeline);


function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, resolve)
            .on('error', reject) 
            .on('socket', (socket) => {
                socket.emit('agentRemove');
            });    
    })
}

// TODO -> create validation for url
const fetchPipe = new Transform({
    async transform(chunk, encoding, callback) {
        try {

            const inputUrl = chunk.toString();

            if(!url.parse(inputUrl).hostname) {
                throw new Error(`String ${inputUrl.replace(/(\r\n|\n|\r)/gm, "")} is not a valid url`);
            }

            const response = await fetch(inputUrl);
            callback(null, JSON.stringify({
                headers: response.headers,
                body: response.body
            }));
        } catch (error) {
            console.log(error);
            callback(error);
        }
    }
  });


function convertToStream(values) {
    const readStream = new Readable();

    [values, null].reduce(
        (stream, data) => stream.push(data) && stream,
        readStream
    );

    return readStream;
}

function ping(readStream, writeStream, wasRequired = false) {

    assert.ok(readStream, 'Read stream is missing');
    assert.ok(writeStream, 'Write stream is missing');

    if (Buffer.isBuffer(readStream) || typeof readStream === 'string') {
        readStream = convertToStream(readStream);
    }

    const chunks = [];

    return new Promise((resolve, reject) => {
        return (wasRequired) 
            ? pipelinep(readStream, fetchPipe, writeStream)
            : pipeline(readStream, fetchPipe, writeStream, (err) => err ? reject(err) : null)
                .on('data', chunk => chunks.push(chunk))
                .on('error', reject)
                .on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}


module.exports = {
    ping
}
