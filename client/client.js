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
  metadata.add('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzA5MjQzMTIsImV4cCI6MTczMTAxMDcxMn0.2ixWLXkgiVh_0aoHeHcQgjW657BAlqrQm4p4I3Brkkw');
  return metadata;
}


const client = new productServicesDefination.ProductServiceClient(
  ENDPOINT,
  sslCredentials
);

// Helper to handle responses
const handleResponse = (err, response) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Response:', response);
  }
};

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

    const call = client.createProduct(createProductRequest, getMetadata(), handleResponse);

    //Get server response
    call.on('data', (response) => {
      console.log('Server response:', response.getProduct().toObject());
    });

    
  } catch (err) {
    console.error({ "createProduct": err });
  }

}

// 2. Get Products with Pagination and Filtering
// function getProducts(page = 1, limit = 5, category = '', minPrice = 0, maxPrice = 100) {
//     const request = {
//         page,
//         limit,
//         category,
//         min_price: minPrice,
//         max_price: maxPrice
//     };

//     client.GetProducts(request, getMetadata(), handleResponse);
// }

// Usage
createProduct();
// getProducts(1, 5, 'Electronics');
