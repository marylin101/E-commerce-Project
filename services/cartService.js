const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const { badReq } = require('../utils/badRequests');

let cart;

const getOrCreateCart = async (userId) => {
    cart = await cartRepository.getCartByUserId(userId);
    if(!cart){
        cart = await cartRepository.createCart(userId);
    }
    return cart;
};

const getCart = async (userId) => {
    cart = await getOrCreateCart(userId);
    return cart;
};

const addItem = async (userId, productId, quantity) => {
    if(!productId || !quantity || quantity < 1){
        const reason = !productId ? 'The product ID is required.' :(!quantity?'Please enter a valid quantity.': 'The quantity must be 1 or greater than 1.'); 
        return badReq(reason);
    }
    const product = await productRepository.getProductById(productId);
    if(!product){
        return badReq('Product not found.');
    }
    await getOrCreateCart(userId);
    const addedItem = await cartRepository.addItemToCart(userId, productId, quantity);
    return addedItem;
};

const updateItem = async (userId, productId, quantity) => {
    if(!quantity || quantity < 1){
        return badReq('The products quantity must be at least 1.');
    };
    const updatedItem = await cartRepository.updateQuantity(userId, productId, quantity);
    return updatedItem;
};

const removeItem = async (userId, productId) => {
    const removedItem = await cartRepository.removeItem(userId, productId);
    return removedItem;
};

module.exports = { getCart, addItem, updateItem, removeItem };