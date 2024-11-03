#!/bin/bash

echo "Creating certs folder ..."
mkdir -p certs && cd certs

echo "Generating certificates ..."

# Generate CA key and certificate
openssl genrsa -passout pass:'!!19$^ashiK!!19$^' -des3 -out ca.key 4096
openssl req -passin pass:'!!19$^ashiK!!19$^' -new -x509 -days 365 -key ca.key -out ca.crt -subj "/C=CL/ST=RM/L=Santiago/O=Test/OU=Test/CN=ca"

# Generate server key and certificate
openssl genrsa -passout pass:'!!19$^ashiK!!19$^' -des3 -out server.key 4096
openssl req -passin pass:'!!19$^ashiK!!19$^' -new -key server.key -out server.csr -subj "/C=CL/ST=RM/L=Santiago/O=Test/OU=Server/CN=localhost"
openssl x509 -req -passin pass:'!!19$^ashiK!!19$^' -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
openssl rsa -passin pass:'!!19$^ashiK!!19$^' -in server.key -out server.key

# Generate client key and certificate
openssl genrsa -passout pass:'!!19$^ashiK!!19$^' -des3 -out client.key 4096
openssl req -passin pass:'!!19$^ashiK!!19$^' -new -key client.key -out client.csr -subj "/C=CL/ST=RM/L=Santiago/O=Test/OU=Client/CN=localhost"
openssl x509 -passin pass:'!!19$^ashiK!!19$^' -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
openssl rsa -passin pass:'!!19$^ashiK!!19$^' -in client.key -out client.key

# Clean up CSR files
rm server.csr client.csr ca.key

echo "Certificates generated successfully."