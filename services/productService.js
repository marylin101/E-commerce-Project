const productRepository = require('../repositories/productRepository');
const { notFound,badReq } = require('../utils/badRequests');
const ApiError = require('../utils/ApiError');

const createProduct = async (data) => {
    const load = {
        ...data,
        price: data.price !== undefined ? Number(data.price) : undefined,
        stockQty: data.stockQty !== undefined ? Number(data.stockQty) : undefined,
    };
    if(!load.name || !load.sku || !load.categoryId || load.price === undefined || load.stockQty === undefined){
        throw ApiError.badRequest('There are missing required fields: name, sku, categoryId, price, stockQty are required to create a product.');
    }
    if(Number.isNaN(load.price) || load.price < 0 || Number.isNaN(load.stockQty) || load.stockQty < 0){
        throw ApiError.badRequest('Price and stock quantity must not be negative values.');
    }
    const newProduct = await productRepository.createProduct(load);
    return newProduct;
};

const listProducts = async (filters= {}) => {
    const filteredProducts = {
        ...filters,
        page: filters.page ? Number(filters.page) : 1,
        limit: filters.limit ? Number(filters.limit) : 20,
    };
    const result = await productRepository.findProducts(filteredProducts);
    if(!result){
        throw ApiError.notFound('No products found matching the specified criteria.');
    }
    return result;
};

const getProductById = async (id) => {
    const product = await productRepository.findProductById(id);
    if (!product) {
        throw ApiError.notFound(`Product with ID ${id} was not found.`);
    }
    return product;
};

const updateProduct = async (id, update) => {
    const load = {...update};
    if(load.price !== undefined){
        load.price = Number(load.price);
        if(Number.isNaN(load.price)|| load.price < 0){
            throw ApiError.badRequest('Price must be a valid non-negative number.');
        }
    }
    if(load.stockQty !== undefined){
        load.stockQty = Number(load.stockQty);
        if(Number.isNaN(load.stockQty) || load.stockQty < 0){
            throw ApiError.badRequest('Stock quantity must not be a negative number.');
        }
    }
    const updatedProduct = await productRepository.updateProduct(id, load);
    if(!updatedProduct){
        throw ApiError.notFound('Product with ID ' +id+ ' was not found.');
    }
    return updatedProduct;
};

const deleteProduct = async (id) => {
    const deletedProduct = await productRepository.deleteProduct(id);
    if(!deletedProduct){
        throw ApiError.notFound('Product with ID ' +id+ ' was not found.');
    }
    return true;
};

module.exports = { createProduct, listProducts, getProductById, updateProduct, deleteProduct};
