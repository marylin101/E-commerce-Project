const ApiError = require('../utils/ApiError');

function validateCartItem(req, res, next) {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
        throw ApiError.badRequest('There are missing required fields: productId and quantity are required.');
    }
    if (typeof quantity !== 'number' || quantity <= 0 || Number.isNaN(quantity)) {
        throw ApiError.badRequest('Quantity must be a valid positive number.');
    }
    next();
}

function validateUpdateCart(req, res, next) {
    const { quantity } = req.body;
    if (quantity === undefined) {
        throw ApiError.badRequest('Quantity is required to update the cart item.');
    }
    if (typeof quantity !== 'number' || quantity <= 0 || Number.isNaN(quantity)) {
        throw ApiError.badRequest('Quantity must be a valid positive number.');
    }
    next();
}

module.exports = { validateCartItem, validateUpdateCart };