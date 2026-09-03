const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const { badReq, notFound } = require('../utils/badRequests');

const getCart = async (userId) => {
    const cart = await cartRepository.getCart(userId);
    return cart;
};

const addItem = async (userId, productId, quantity) => {
    if(!productId || !quantity || quantity < 1){
        const reason = !productId 
        ? 'The product ID is required.' 
        :(!quantity?'Please enter a valid quantity.': 'The quantity must be 1 or greater than 1.'); 
        throw badReq(reason);
    }
    const product = await productRepository.findProductById(productId);
    if(!product){
        throw badReq('Product not found.');
    }
    const updatedCart = await cartRepository.addItem(userId, {
        productId,
        quantity: Number(quantity),
        priceAtAdd: product.price
    });
    return updatedCart;
};

const updateItem = async (userId, productId, quantity) => {
    if(!quantity || quantity < 1){
        throw badReq('The products quantity must be at least 1.');
    };
    const updatedItem = await cartRepository.updateQuantity(userId, productId, Number(quantity));
    if(!updatedItem){
        throw notFound("The product was not found in the cart.");
    }
    return updatedItem;
};

const removeItem = async (userId, productId) => {
    const removedItem = await cartRepository.removeItem(userId, productId);
    return removedItem;
};

module.exports = { getCart, addItem, updateItem, removeItem };