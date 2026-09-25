const ApiError = require('../utils/ApiError');
const {ORDER_STATUS} = require('../utils/constants');

function validatePlaceOrder(req, res, next) {
    const {addressId } = req.body;
    if (!addressId || typeof addressId !== 'string' || !addressId.trim()) {
        throw ApiError.badRequest('Valid addressId is required to place an order.');
    }
    next();
}

function validateUpdateOrderStatus(req, res, next) {
    const { status } = req.body;
    if (!status || !Object.values(ORDER_STATUS).includes(status)) {
        throw ApiError.badRequest(`Invalid status. Allowed values are: ${Object.values(ORDER_STATUS).join(', ')}`);
    }
    next();
}

module.exports = { validatePlaceOrder, validateUpdateOrderStatus };