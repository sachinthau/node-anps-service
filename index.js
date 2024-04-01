const http2 = require('http2');
const fs = require('fs');

// openssl pkcs12 -in Certificates.p12 -out xxx.crt.pem -clcerts -nokeys
// openssl pkcs12 -in Certificates.p12 -out xxx.key.pem -nocerts -nodes

// apns device token 
const APNS_DEVICE_TOKEN = 'XXXX';

const ENV = 'PROD'; // PROD
/* 
    Development server: api.sandbox.push.apple.com:443
    Production server: api.push.apple.com:443

    Use 'https://api.push.apple.com' for production build
*/
let host = 'https://api.push.apple.com'
let certsPath = 'prod';
const path = `/3/device/${APNS_DEVICE_TOKEN}`

/*
Using certificate converted from p12.
The code assumes that your certificate file is in same directory.
Replace/rename as you please
*/
if (ENV === 'DEV') {
    host = 'https:///api.sandbox.push.apple.com';
    certsPath = 'dev';
}

const client = http2.connect(host, {
    key: fs.readFileSync(__dirname + `/certs/${certsPath}/xxx.key.pem`),
    cert: fs.readFileSync(__dirname + `/certs/${certsPath}/xxx.crt.pem`)
});

client.on('error', (err) => console.error(err));

const body = {
    "aps": {
        "alert": {
            "title": "Title",
            "body": "Some Message"
        },
        "category": "SOME_CAT"
    },
    "userInfo": {
        "data": "data"
    }
}

const headers = {
    ':method': 'POST',
    'apns-topic': 'xxx.xxx.com', // you application bundle ID
    ':scheme': 'https',
    ':path': path
}

const request = client.request(headers);

request.on('response', (resHeaders, flags) => {
    for (const name in resHeaders) {
        console.log(`${name}: ${resHeaders[name]}`);
    }
});

request.setEncoding('utf8');

let data = ''
request.on('data', (chunk) => { data += chunk; });
request.write(JSON.stringify(body));
request.on('end', () => {
    console.log(`\n${data}`);
    client.close();
});

request.end();
