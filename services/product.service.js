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

        if(!result) {
            return callback({
                code: grpc.status.INTERNAL,
                details: "Internal server error"
            });
        }
        
        callback(null, { product: result });

    } catch (err) {
        console.error({ "createProduct": err });
        callback({
            code: grpc.status.INTERNAL,
            details: "Internal server error"
        });
    }

};

module.exports = {
    createProduct: authInterceptor(createProduct)
}