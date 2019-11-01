
const url = require("url");

const TIMEOUT_IN_MILLISECONDS = 30 * 1000
const NS_PER_SEC = 1e9
const MS_PER_NS = 1e6

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
            ended: undefined,
            unit: 'ms'
        };

        try {
            const options = url.parse(fullUrl);

            const h = selectProtocol(options.protocol);
            
            const req = h.request(options, res => {
                
                let body = '';

                res.once('readable', () => {
                    measurement.firstByte = process.hrtime()
                });

                res.on('data', function (data) {
                    body += data;
                });

                res.on('end', () => {

                    measurement.ended = process.hrtime()

                    const {
                        start, dnsLookup, tcpConnection,
                        tlsHandshake, firstByte, ended,
                    } = measurement

                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        measurement: {
                            dnsLookup: dnsLookup ? measure(start, dnsLookup) : undefined,
                            tcpConnection: measure((dnsLookup || start), tcpConnection),
                            tlsHandshake: (tlsHandshake) ? measure(tcpConnection, tlsHandshake) : undefined,
                            firstByte: measure((tlsHandshake || tcpConnection), firstByte),
                            contentTransfer: measure(firstByte, ended),
                            total: measure(start, ended),
                            unit: 'ms' 
                        },
                        bodySize: body.length
                    });
                })
            });

            // Used for retrving data from the 
            // request standpoint
            req.on('socket', (socket) => {
                socket.on('lookup', () => {
                    measurement.dnsLookup = process.hrtime();
                });
                socket.on('connect', () => {
                    measurement.tcpConnection = process.hrtime();
                });
                socket.on('secureConnect', () => {
                    measurement.tlsHandshake = process.hrtime()
                });

                socket.on("timeout", () => {
                    req.abort()
    
                    const error = new Error('ETIMEDOUT');
                    error.code = 'ETIMEDOUT';
                    
                    reject(error)
                });
            });
    
            req.on('error', reject)
    
            return req.end(); 
        } catch (error) {
            reject(error);
        }
    })
}

const measure = (hrstart, hrend) => {
    const secondDiff = hrend[0] - hrstart[0]
    const nanoSecondDiff = hrend[1] - hrstart[1]
    const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff
  
    return diffInNanoSecond / MS_PER_NS
}

module.exports = {
    measure,
    fetch,
    selectProtocol,
    streamBuffer
}