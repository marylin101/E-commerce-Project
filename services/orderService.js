const orderRepository = require('../repositories/orderRepository');
const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const addressRepository = require('../repositories/addressRepository');
const { badReq, notFound, forbidden } = require('../utils/badRequests');

const createOrder = async (userId, addressId) => {
    if(!addressId){
        throw badReq('The address ID is required to create an order.');
    };
    const cart = await cartRepository.getCart(userId);
    if(!cart || !cart.items || cart.items.length === 0){
        throw badReq('Your cart is currently empty. Please add items to your cart before placing an order.');
    };

    let totalAmount = 0;
    const validatedItems = [];

    for(const item of cart.items){
        const product = await productRepository.findProductById(item.productId);
        if(!product){
            throw badReq('Product with ID' +item.productId+ ' was nor found.');
        }
        if(product.stockQuantity=== 0){
            throw badReq('The product ' +product.name+ ' is currently out of stock.');
        }
        if(product.stockQuantity < item.quantity){
            throw badReq('The product ' +product.name+ ' only has ' +product.stockQuantity+ ' units in stock - you asked for '+item.quantity+'.');
        }

        totalAmount += product.price * item.quantity;
        validatedItems.push({
            productId: item.productId,
            name: product.name,
            quantity: item.quantity,
            price: product.price
        });
        
    }
    const order = await orderRepository.createOrder({
        userId, 
        addressId, 
        items: validatedItems, 
        totalAmount
    });
    for(const item of validatedItems){
        const decStock = await productRepository.decreaseStock(item.productId,  item.quantity );
        return decStock;
    }

    await cartRepository.clearCart(userId);
    return order;

};

const getOrdersByUserId = async (userId) => {
    const orders = await orderRepository.findOrdersByUserId(userId);
    if(!orders || orders.length === 0){
        throw notFound('There is no orders found for this user.');
    }
    return orders || [];
};

const getOrder = async (userId, orderId) => {
    const order = await orderRepository.findOrderById(orderId);
    if(!order){
        throw notFound('Order not found.');
    }
   if(requestingUser.role !== "admin" && String(order.userId) !== String(userId)){ 
        throw forbidden('Youdo not have access to this order.');
    }
    return order;
};

const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

const updateOrderStatus = async (orderId, status) => {
    if(!validStatuses.includes(status)){
        throw badReq('Invalid status. Valid statuses includes: ' + validStatuses.join(', '));
    }
    const updated = await orderRepository.updateOrderStatus(orderId, status);
    if(!updated){
        throw notFound('This order was not found.');
    }
    return updated;
};

module.exports = { createOrder, getOrdersByUserId, getOrder, updateOrderStatus };
