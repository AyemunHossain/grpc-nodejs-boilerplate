const Joi = require('joi');

// Product schema
const productSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().required(),
  category: Joi.string().optional()
});

// CreateProductRequest schema
const createProductRequestSchema = Joi.object({
  product: productSchema.required()
});

// GetProductsRequest schema
const getProductsRequestSchema = Joi.object({
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
  category: Joi.string().optional(),
  minPrice: Joi.number().optional(),
  maxPrice: Joi.number().optional()
});

// UpdateProductRequest schema
const updateProductRequestSchema = Joi.object({
  product: productSchema.required()
});

// DeleteProductRequest schema
const deleteProductRequestSchema = Joi.object({
  id: Joi.number().integer().required()
});

const updatePriceRequestSchema = Joi.object({
  id: Joi.number().integer().required(),
  newprice: Joi.number().required()
});

module.exports = {
  productSchema,
  createProductRequestSchema,
  getProductsRequestSchema,
  updateProductRequestSchema,
  deleteProductRequestSchema,
  updatePriceRequestSchema
};