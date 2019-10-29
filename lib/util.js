
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
        try {
            const options = url.parse(fullUrl);

            const h = selectProtocol(options.protocol);
    
            const hrstart = process.hrtime();
        
            const req = h.request(options, res => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    ping: measure(hrstart)
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
    
    return hrend[0], hrend[1] / 1000000
}

module.exports = {
    measure,
    fetch,
    selectProtocol,
    streamBuffer
}