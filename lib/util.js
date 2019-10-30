
const url = require("url");

const streamBuffer = stream => new Promise((resolve, reject) => {
    const chunks = [];

    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks))),
    stream.on('data', d => chunks.push(d));
});

const selectProtocol = (protocol) => {
    const https = require('https');
    const http = require('http'); 

    if (protocol === 'https:') {
        return https;
    } else if (protocol === 'http:') {
        return http;
    } else {
        throw new Error(`Unknow protocol [%s]`, protocol);
    }
}


function fetch(fullUrl) {
    return new Promise((resolve, reject) => {

        const measurement = {
            start: process.hrtime(),
            dnsLookup: undefined,
            tcpConnection: undefined,
            tlsHandshake: undefined,
            firstByte: undefined,
            end: undefined,
            unit: 'ms'
        };

        try {
            const options = url.parse(fullUrl);

            const h = selectProtocol(options.protocol);
            
            const req = h.request(options, res => {

                res.once('readable', () => {
                    measurement.firstByte = measure(measurement.start);
                })

                res.on('end', () => {
                    measurement.end = measure(measurement.start);
                    measurement.start = measurement.start[1] / 1000000;
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        measurement,
                    });
                })
            });

            // Used for retrving data from the 
            // request standpoint
            req.on('socket', (socket) => {
                socket.on('lookup', () => {
                    measurement.dnsLookup = measure(measurement.start);
                });
                socket.on('connect', () => {
                    measurement.tcpConnection = measure(measurement.start);
                });
                socket.on('secureConnect', () => {
                    measurement.tlsHandshake = measure(measurement.start);
                });
            })
    
            req.on('error', reject)
    
            return req.end(); 
        } catch (error) {
            reject(error);
        }
    })
}

const measure = (hrstart) => {
    hrend = process.hrtime(hrstart)
    
    return  hrend[1] / 1000000
}

module.exports = {
    measure,
    fetch,
    selectProtocol,
    streamBuffer
}