const productService = require('../services/productService');
const {sucResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createProduct = asyncHandler(async (req, res) => {
    const productData = req.body;
    const product = await productService.createProduct(productData);
    return sucResponse(res, {product}, 201);
});

const listProducts = asyncHandler(async (req, res) => {
    const products = await productService.listProducts(req.query);
    return sucResponse(res, {products}, 200);
});

const getProductById = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await productService.getProductById(productId);
    return sucResponse(res, {product}, 200);
});

const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const updateData = req.body;
    const updatedProduct = await productService.updateProduct(productId, updateData);
    return sucResponse(res, {updatedProduct}, 200);
});

const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    await productService.deleteProduct(productId);
    return sucResponse(res, {message: 'Product deleted successfully'}, 200);
}); 


module.exports = { createProduct, listProducts, getProductById, updateProduct, deleteProduct };