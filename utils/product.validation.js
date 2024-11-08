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
  min_price: Joi.number().optional(),
  max_price: Joi.number().optional()
});

// UpdateProductRequest schema
const updateProductRequestSchema = Joi.object({
  product: productSchema.required()
});

// DeleteProductRequest schema
const deleteProductRequestSchema = Joi.object({
  id: Joi.number().integer().required()
});

module.exports = {
  productSchema,
  createProductRequestSchema,
  getProductsRequestSchema,
  updateProductRequestSchema,
  deleteProductRequestSchema
};