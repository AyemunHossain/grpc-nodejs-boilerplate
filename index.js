const grpc = require('@grpc/grpc-js');
require('dotenv').config();
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');

const rootCert = fs.readFileSync('./certs/ca.crt');
const certChain = fs.readFileSync('./certs/server.crt');
const privateKey = fs.readFileSync('./certs/server.key');

const serverCredentials = grpc.ServerCredentials.createSsl(rootCert, [{
  cert_chain: certChain,
  private_key: privateKey
}], true);

const numCPUs = os.cpus().length;

function startServer() {
  const server = new grpc.Server();

  server.bindAsync(process.env.HOST + ':' + process.env.PORT, serverCredentials, (error, port) => {
    if (error) {
      console.error(`Server binding error: ${error.message}`);
      return;
    }
    console.log(`Server running on port ${port}`);
  });
}

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Optionally, you can fork a new worker here
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  // In this case, it is a gRPC server
  startServer();
  console.log(`Worker ${process.pid} started`);
}