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
  metadata.add('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzE1MjYxODgsImV4cCI6MTczMTYxMjU4OH0.kLcvAVS_8nPnugqmccBES5Vwa5w41STGcMheDLyZcB0');
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

    const call = client.createProduct(createProductRequest, getMetadata(), (err, response) => {
      if (err) {
        console.error({ "createProduct": err });
      }
      if (response) {
        console.log('Server response:', response.getProduct().toObject());
      }

    });


  } catch (err) {
    console.error({ "createProduct": err });
  }

}

// 2. Get Products with Pagination and Filtering
function getProducts() {
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

// 3. Update a Product: Client streaming API
function updateProducts() {

  const call = client.updateProduct(getMetadata(),(error, response) => {
    if (!error) {
      const updatedProducts = response.getUpdatedProductsList();
      console.log("Updated Products:", updatedProducts.map(p => p.getName()).join(', '));
    } else {
      console.error("Error:", error);
    }
  });


  const products = [
    { id: 1, name: "Product A", description: "Updated Description A", price: 49.99, category: "Category A" },
    { id: 2, name: "Product B", description: "Updated Description B", price: 59.99, category: "Category B" },
    { id: 3, name: "Product C", description: "Updated Description C", price: 69.99, category: "Category C" }
  ];


  products.forEach((productData) => {
    const product = new productProto.Product();
    product.setId(productData.id);
    product.setName(productData.name);
    product.setDescription(productData.description);
    product.setPrice(productData.price);
    product.setCategory(productData.category);

    const updateRequest = new productProto.UpdateProductRequest();
    updateRequest.setProduct(product);

    call.write(updateRequest);
  });

  call.end();


}


// Usage
createProduct();
// getProducts();
// updateProducts();