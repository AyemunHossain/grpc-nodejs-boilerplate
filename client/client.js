const grpc = require('@grpc/grpc-js');
const fs = require('fs');
const rootCert = fs.readFileSync('./certs/ca.crt');
const privateKey = fs.readFileSync('./certs/client.key');
const certChain = fs.readFileSync('./certs/client.crt');
const productProto = require('../protos/product_pb');
const productServicesDefination = require('../protos/product_grpc_pb');

const sslCredentials = grpc.credentials.createSsl(rootCert, privateKey, certChain);
const ENDPOINT = 'localhost:6002';

// Add metadata for authentication
function getMetadata() {
  const metadata = new grpc.Metadata();
  metadata.add('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzE0MzY5NDcsImV4cCI6MTczMTUyMzM0N30.xP5fGKbePzo3Z6-yfPlLeSV-tG2hZ8ld7UD2wrdy_dw');
  return metadata;
}

const client = new productServicesDefination.ProductServiceClient(
  ENDPOINT,
  sslCredentials
);

// 1. Create a Product
function createProduct() {
  try {

    // Create a new Product instance
    const product = new productProto.Product();
    product.setName('Sample Product');
    product.setDescription('A sample product description');
    product.setPrice(29.99);
    product.setCategory('Electronics');

    const createProductRequest = new productProto.CreateProductRequest();
    createProductRequest.setProduct(product);

    const call = client.createProduct(createProductRequest, getMetadata(), (err, response)=>{
      if(err){
        console.error({ "createProduct": err });
      }
      if(response){
        console.log('Server response:', response.getProduct().toObject());
      }

    });

    
  } catch (err) {
    console.error({ "createProduct": err });
  }

}

// 2. Get Products with Pagination and Filtering
function getProducts(){
  try {
    const getProductsRequest = new productProto.GetProductsRequest();
    getProductsRequest.setPage(1);
    getProductsRequest.setLimit(20);
    getProductsRequest.setCategory('Electronics');
    getProductsRequest.setMinPrice(20);
    getProductsRequest.setMaxPrice(100);

    const call = client.getProducts(getProductsRequest, getMetadata());
    call.on('data', (response) => {
      console.log('Server response:', response.getProducts().getName());
    });

    call.on('end', () => {
      console.log('Server has stopped sending data');
    });

  } catch (err) {
    console.error({ "getProducts": err });
  }
}

// Usage
// createProduct();
getProducts();

// getProducts(1, 5, 'Electronics');
