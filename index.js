const grpc = require('@grpc/grpc-js');
require('dotenv').config();
const fs = require('fs');

const rootCert = fs.readFileSync('./certs/ca.crt');
const certChain = fs.readFileSync('./certs/server.crt');
const privateKey = fs.readFileSync('./certs/server.key');

const serverCredentials = grpc.ServerCredentials.createSsl(rootCert, [{
  cert_chain: certChain,
  private_key: privateKey
}], true);


function main() {
  const server = new grpc.Server();

  server.bindAsync(process.env.HOST + ':' + process.env.PORT, serverCredentials, (error, port) => {
    if (error) {
      console.error(`Server binding error: ${error.message}`);
      return;
    }
    console.log(`Server running on port ${port}`);
  });
}

main();