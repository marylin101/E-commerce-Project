const orderRepository = require('../repositories/orderRepository');
const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const { badReq, notFound, forbidden } = require('../utils/badRequests');

const createOrder = async (userId) => {
    if(!addressId){
        return badReq('Address ID is required to create an order.');
    };
    const cart = await cartRepository.getCartByUserId(userId);
    if(!cart || !cart.items || cart.items.length === 0){
        return badReq('Your cart is currently empty. Please add items to your cart before placing an order.');
    };

    let totalAmount = 0;
    for(const item of cart.items){
        const product = await productRepository.getProductById(item.productId);
        if(!product){
            return badReq(`Product with ID ${item.productId} was nor found.`);
        };
        
    }
}