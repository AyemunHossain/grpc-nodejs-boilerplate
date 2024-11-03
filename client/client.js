const grpc = require('@grpc/grpc-js');
const fs = require('fs');
const rootCert = fs.readFileSync('./certs/ca.crt');
const privateKey = fs.readFileSync('./certs/client.key');
const certChain = fs.readFileSync('./certs/client.crt');

const clientCredentials = grpc.credentials.createSsl(rootCert,privateKey, certChain);
const ENDPOINT = 'localhost:6001';

const metadata = new grpc.Metadata();
metadata.add('authorization', 'Bearer eyJhbGciOiJIUzI1NidIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzA2MjU5MzgsImV4cCI6MTczMDcxMjMzOH0.s2yoQw451SRs6UCDmNSNiq0--euDm8s-zTE1ESzl7SE');


function main() {
  console.log('Client is running...');
}

main();