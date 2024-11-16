const grpc = require("@grpc/grpc-js");
require("dotenv").config();
const productProtoModel = require("../protos/product_pb");
const productModel = require("../models/product");
const productValidation = require("../utils/product.validation");
const validateRequest = require("../middlewares/req-validation");
const authInterceptor = require("../middlewares/authentication");

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
                details: "Internal server error",
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
        console.error({ createProduct: err });
        callback({
            code: grpc.status.INTERNAL,
            details: "Internal server error",
        });
    }
};

// Get Product service: Server Streaming API
const getProducts = async (call, callback) => {
    try {
        // Validate the request
        validateRequest(productValidation.getProductsRequestSchema, call.request);

        // Get the request data
        const page = call.request.getPage();
        const limit = call.request.getLimit();
        const category = call.request.getCategory();
        const minPrice = call.request.getMinPrice();
        const maxPrice = call.request.getMaxPrice();

        const products = await productModel.getProducts(
            page,
            limit,
            category,
            minPrice,
            maxPrice
        );

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
        console.error({ getProducts: err });
        callback({
            code: grpc.status.INTERNAL,
            details: "Internal server error",
        });
    }
};

// Update Product service: Client Streaming API
const updateProduct = async (call, callback) => {
    try {
        const products = [];

        call.on("data", (request) => {
            // Validate the request
            validateRequest(productValidation.updateProductRequestSchema, request);

            const product = request.getProduct();
            // Get the product details
            const id = product.getId();
            const name = product.getName();
            const description = product.getDescription();
            const price = product.getPrice();
            const category = product.getCategory();

            products.push({
                id,
                name,
                description,
                price,
                category,
            });
        });

        call.on("end", async () => {

            // Update the products
            try {
                for (const item of products) {
                    await productModel.updateProduct(item);
                }


                const response = new productProtoModel.UpdateProductResponse();

                products.forEach((product) => {
                    const productResponse = new productProtoModel.Product();
                    productResponse.setId(product.id);
                    productResponse.setName(product.name);
                    productResponse.setDescription(product.description);
                    productResponse.setPrice(product.price);
                    productResponse.setCategory(product.category);
                    response.addProduct(productResponse);
                });
                callback(null, response);
            } catch (err) {
                console.error({ updateProduct: err });
                callback({
                    code: grpc.status.INTERNAL,
                    details: "Internal server error",
                });
            }


        });
    } catch (err) {
        console.error({ updateProduct: err });
        callback({
            code: grpc.status.INTERNAL,
            details: "Internal server error",
        });
    }
};

// Delete Product service: Unary API
const deleteProduct = async (call, callback) => {
    try {
        // Validate the request
        validateRequest(productValidation.deleteProductRequestSchema, call.request);

        // Get the product id
        const id = call.request.getId();

        const result = await productModel.deleteProduct(id);

        if (!result) {
            return callback({
                code: grpc.status.INTERNAL,
                details: "Internal server error",
            });
        }

        // Create a response
        const response = new productProtoModel.DeleteProductResponse();
        response.setStatus("Product deleted successfully");

        callback(null, response);
    } catch (err) {
        console.error({ deleteProduct: err });
        callback({
            code: grpc.status.INTERNAL,
            details: "Internal server error",
        });
    }
};

//PriceUpdates service: Bidirectional Streaming API
const priceUpdates = async (call) => {
    call.on("data", async (request) => {
        try {
            // Validate the request
            validateRequest(productValidation.updatePriceRequestSchema, request);

            // Get the product details
            const productId = request.getId();
            const newPrice = request.getNewprice();

            const result = await productModel.setPrice(productId, newPrice);

            if (!result) {
                return call.write({
                    code: grpc.status.INTERNAL,
                    details: "Internal server error",
                });
            }

            // Create a response
            const response = new productProtoModel.PriceUpdateResponse();
            response.setId(result.id);
            response.setUpdatedprice(result.price);
            call.write(response); // Send response to the client
        } catch (err) {
            console.error("Error during priceUpdates:", err);
            call.write({
                code: grpc.status.INTERNAL,
                details: "Internal server error",
            });
        }
    });

    // Handle when the client signals the end of the stream
    call.on("end", () => {
        console.log("Client has finished streaming. Ending server stream.");
        call.end(); // End the server's response stream
    });

    // Handle errors during streaming
    call.on("error", (err) => {
        console.error("Stream error:", err);
        call.end(); // End the stream on error
    });
};


// Export the service
module.exports = {
    authenticated: {
        createProduct: authInterceptor(createProduct),
        getProducts: authInterceptor(getProducts),
        updateProduct: authInterceptor(updateProduct),
        deleteProduct: authInterceptor(deleteProduct),
        priceUpdates: authInterceptor(priceUpdates),
    },
    unauthenticated: {
        createProduct,
        getProducts,
        updateProduct,
        deleteProduct,
        priceUpdates,
    },
};


