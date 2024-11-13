# grpc-nodejs-boilerplate

# Project Description
This project builds a scalable gRPC  in Node.js, enabling fast, secure, and efficient inter-service communication. gRPC, a high-performance RPC framework by Google, supports language-agnostic, type-safe communication. By implementing Protocol Buffers, HTTP/2, and TLS, this project enhances speed, security, and reliability with Node.js services.

# Technologies
1. Node.js
2. gRPC
3. Protocol Buffers
4. HTTP/2
5. TLS


# Project Structure
1. **cert**: Contains SSL certificates for secure communication.
2. **protos**: Contains Protocol Buffers files for defining gRPC services.
3. **client**:  Contains client-side code for making gRPC requests.
4. **models**: Contains data models for defining request and response objects (.proto files).
5. **middleware**: Contains middleware functions for intercepting and modifying gRPC requests.
6. **utils**: Contains utility functions for handling gRPC requests and responses.
7. **index.js**: Contains server-side code for defining gRPC services and starting the server.
8. **config**: Contains configuration settings for the server.
9. **microservice**: Contains microservices for handling gRPC requests.
10. **package.json**: Contains metadata and dependencies for the project.
11. **scripts**: Contains scripts for generating gRPC service and client files.
12. **utils**: Contains utility functions for handling gRPC requests and responses.
13. **.env**: Contains environment variables for the project.
14. **package.json**: Contains dependency tree for the project.

# Prerequisites
1. Node.js
2. npm
3. Protocol Buffers Compiler (protoc)
4. gRPC Node.js Plugin (not required for Node.js 12 and above)

# Setup
1. Clone the repository.
2. Install protoc (Protocol Buffers Compiler) on a Linux system, follow these steps: 

```bash
sudo apt update
sudo apt install -y unzip wget
```
Download the protoc Binary

```bash
wget https://github.com/protocolbuffers/protobuf/releases/download/v23.3/protoc-23.3-linux-x86_64.zip
```
Extract the Binary

```bash
unzip protoc-23.3-linux-x86_64.zip -d protoc
```
Move protoc to a Directory in Your PATH

```bash
sudo mv protoc/bin/protoc /usr/local/bin/
sudo mv protoc/include/* /usr/local/include/
```
Verify Installation

```bash
protoc --version
```

3. Install the dependencies using the following command:
```bash
npm install
```
3. Generate the gRPC service and client files using the following command:
```bash
npm run rpc
```
4. Start the server using the following command:
```bash
npm run server
```
5. Start the client using the following command:
```bash
npm run client
```

# Conclusion
This project demonstrates how to build a scalable gRPC server in Node.js. By leveraging gRPC, Protocol Buffers, HTTP/2, and TLS, this project enhances speed, security, and reliability in inter-service communication. For more information, refer to the official [gRPC documentation](https://grpc.io/docs/).