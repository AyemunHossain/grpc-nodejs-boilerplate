// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var product_pb = require('./product_pb.js');

function serialize_product_CreateProductRequest(arg) {
  if (!(arg instanceof product_pb.CreateProductRequest)) {
    throw new Error('Expected argument of type product.CreateProductRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_CreateProductRequest(buffer_arg) {
  return product_pb.CreateProductRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_CreateProductResponse(arg) {
  if (!(arg instanceof product_pb.CreateProductResponse)) {
    throw new Error('Expected argument of type product.CreateProductResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_CreateProductResponse(buffer_arg) {
  return product_pb.CreateProductResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_DeleteProductRequest(arg) {
  if (!(arg instanceof product_pb.DeleteProductRequest)) {
    throw new Error('Expected argument of type product.DeleteProductRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_DeleteProductRequest(buffer_arg) {
  return product_pb.DeleteProductRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_DeleteProductResponse(arg) {
  if (!(arg instanceof product_pb.DeleteProductResponse)) {
    throw new Error('Expected argument of type product.DeleteProductResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_DeleteProductResponse(buffer_arg) {
  return product_pb.DeleteProductResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_GetProductsRequest(arg) {
  if (!(arg instanceof product_pb.GetProductsRequest)) {
    throw new Error('Expected argument of type product.GetProductsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_GetProductsRequest(buffer_arg) {
  return product_pb.GetProductsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_GetProductsResponse(arg) {
  if (!(arg instanceof product_pb.GetProductsResponse)) {
    throw new Error('Expected argument of type product.GetProductsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_GetProductsResponse(buffer_arg) {
  return product_pb.GetProductsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_PriceUpdateRequest(arg) {
  if (!(arg instanceof product_pb.PriceUpdateRequest)) {
    throw new Error('Expected argument of type product.PriceUpdateRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_PriceUpdateRequest(buffer_arg) {
  return product_pb.PriceUpdateRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_PriceUpdateResponse(arg) {
  if (!(arg instanceof product_pb.PriceUpdateResponse)) {
    throw new Error('Expected argument of type product.PriceUpdateResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_PriceUpdateResponse(buffer_arg) {
  return product_pb.PriceUpdateResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_UpdateProductRequest(arg) {
  if (!(arg instanceof product_pb.UpdateProductRequest)) {
    throw new Error('Expected argument of type product.UpdateProductRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_UpdateProductRequest(buffer_arg) {
  return product_pb.UpdateProductRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_UpdateProductResponse(arg) {
  if (!(arg instanceof product_pb.UpdateProductResponse)) {
    throw new Error('Expected argument of type product.UpdateProductResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_UpdateProductResponse(buffer_arg) {
  return product_pb.UpdateProductResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var ProductServiceService = exports.ProductServiceService = {
  createProduct: {
    path: '/product.ProductService/CreateProduct',
    requestStream: false,
    responseStream: false,
    requestType: product_pb.CreateProductRequest,
    responseType: product_pb.CreateProductResponse,
    requestSerialize: serialize_product_CreateProductRequest,
    requestDeserialize: deserialize_product_CreateProductRequest,
    responseSerialize: serialize_product_CreateProductResponse,
    responseDeserialize: deserialize_product_CreateProductResponse,
  },
  deleteProduct: {
    path: '/product.ProductService/DeleteProduct',
    requestStream: false,
    responseStream: false,
    requestType: product_pb.DeleteProductRequest,
    responseType: product_pb.DeleteProductResponse,
    requestSerialize: serialize_product_DeleteProductRequest,
    requestDeserialize: deserialize_product_DeleteProductRequest,
    responseSerialize: serialize_product_DeleteProductResponse,
    responseDeserialize: deserialize_product_DeleteProductResponse,
  },
  getProducts: {
    path: '/product.ProductService/GetProducts',
    requestStream: false,
    responseStream: true,
    requestType: product_pb.GetProductsRequest,
    responseType: product_pb.GetProductsResponse,
    requestSerialize: serialize_product_GetProductsRequest,
    requestDeserialize: deserialize_product_GetProductsRequest,
    responseSerialize: serialize_product_GetProductsResponse,
    responseDeserialize: deserialize_product_GetProductsResponse,
  },
  updateProduct: {
    path: '/product.ProductService/UpdateProduct',
    requestStream: true,
    responseStream: false,
    requestType: product_pb.UpdateProductRequest,
    responseType: product_pb.UpdateProductResponse,
    requestSerialize: serialize_product_UpdateProductRequest,
    requestDeserialize: deserialize_product_UpdateProductRequest,
    responseSerialize: serialize_product_UpdateProductResponse,
    responseDeserialize: deserialize_product_UpdateProductResponse,
  },
  streamPriceUpdates: {
    path: '/product.ProductService/StreamPriceUpdates',
    requestStream: true,
    responseStream: true,
    requestType: product_pb.PriceUpdateRequest,
    responseType: product_pb.PriceUpdateResponse,
    requestSerialize: serialize_product_PriceUpdateRequest,
    requestDeserialize: deserialize_product_PriceUpdateRequest,
    responseSerialize: serialize_product_PriceUpdateResponse,
    responseDeserialize: deserialize_product_PriceUpdateResponse,
  },
};

exports.ProductServiceClient = grpc.makeGenericClientConstructor(ProductServiceService);
