const grpc = require('@grpc/grpc-js');
require('dotenv').config();
const productProtoModel = require('../protos/product_pb');
const productModel = require('../models/product');
const productValidation = require('../utils/product.validation');
const validateRequest = require('../middlewares/req-validation');
const authInterceptor = require('../middlewares/authentication');

// Create product service : Unary API
const createProduct = async (call, callback) => {
    try {
        // Validate the request
        validateRequest(productValidation.createProductRequestSchema, call.request);

        // Get the product details
        const data = call.request.getProduct().toObject();
        const result = await productModel.createProduct(data);

        if (!result) {
            return callback({
                code: grpc.status.INTERNAL,
                details: "Internal server error"
            });
        }

        // Create a response
        const response = new productProtoModel.CreateProductResponse();
        const product = new productProtoModel.Product();
        product.setId(result.id);
        product.setName(result.name);
        product.setDescription(result.description);
        product.setPrice(result.price);
        product.setCategory(result.category);
        response.setProduct(product);

        callback(null, response);

    } catch (err) {
        console.error({ "createProduct": err });
        callback({
            code: grpc.status.INTERNAL,
            details: "Internal server error"
        });
    }

};

// Get Product service: Server Streaming API
const getProducts = async (call, callback) => {
    try {
        // Get the request data
        const page = call.request.getPage();
        const limit = call.request.getLimit();
        const category = call.request.getCategory();
        const minPrice = call.request.getMinPrice();
        const maxPrice = call.request.getMaxPrice();

        const products = await productModel.getProducts(page, limit, category, minPrice, maxPrice);

        products.forEach((product) => {
            
            const response = new productProtoModel.GetProductsResponse();
            const productResponse = new productProtoModel.Product();
            productResponse.setId(product.id);
            productResponse.setName(product.name);
            productResponse.setDescription(product.description);
            productResponse.setPrice(product.price);
            productResponse.setCategory(product.category);
            response.setProducts(productResponse);
            call.write(response);
        });

        call.end();

    } catch (err) {
        console.error({ "getProducts": err });
        callback({
            code: grpc.status.INTERNAL,
            details: "Internal server error"
        });
    }
}

module.exports = {
    createProduct: authInterceptor(createProduct),
    getProducts: authInterceptor(getProducts)
}