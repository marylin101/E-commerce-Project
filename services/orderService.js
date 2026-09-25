const orderRepository = require('../repositories/orderRepository');
const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const ApiError = require('../utils/ApiError');

const createOrder = async (userId, addressId = 'default') => {
  const cart = await cartRepository.getCart(userId);
  if (!cart || !cart.items || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is currently empty. Please add items to your cart before placing an order.');
  }

  let totalAmount = 0;
  const validatedItems = [];

  for (const item of cart.items) {
    const product = await productRepository.findProductById(item.productId);
    if (!product) {
      throw ApiError.badRequest(`Product with ID ${item.productId} was not found.`);
    }
    const currentStock = product.stockQty !== undefined ? product.stockQty : 0;
    if (currentStock === 0) {
      throw ApiError.badRequest(`The product "${product.name}" is currently out of stock.`);
    }
    if (currentStock < item.quantity) {
      throw ApiError.badRequest(`The product "${product.name}" only has ${currentStock} units in stock - you asked for ${item.quantity}.`);
    }

    totalAmount += product.price * item.quantity;
    validatedItems.push({
      productId: item.productId,
      nameSnapshot: product.name,
      quantity: item.quantity,
      priceSnapshot: product.price,
    });
  }

  const order = await orderRepository.createOrder({
    userId,
    addressId: addressId || 'default',
    items: validatedItems,
    totalAmount,
  });

  // Decrease stock for all purchased items
  for (const item of validatedItems) {
    await productRepository.decreaseStock(item.productId, item.quantity);
  }

  // Clear cart after order creation
  await cartRepository.clearCart(userId);

  return order;
};

const getOrders = async (userId, userRole) => {
  if (userRole === 'admin') {
    const allOrders = await orderRepository.getAllOrders();
    return allOrders || [];
  }
  const orders = await orderRepository.findOrdersByUserId(userId);
  return orders || [];
};

const getOrderById = async (userId, orderId, requestingUserRole) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found.');
  }
  if (requestingUserRole !== 'admin' && String(order.userId) !== String(userId)) {
    throw ApiError.forbidden('You do not have access to this order.');
  }
  return order;
};

const validStatuses = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

const updateOrderStatus = async (orderId, status) => {
  const formattedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : status;
  const match = validStatuses.find(s => s.toLowerCase() === (status || '').toLowerCase());
  const finalStatus = match || formattedStatus;

  if (!validStatuses.map(s => s.toLowerCase()).includes((status || '').toLowerCase())) {
    throw ApiError.badRequest(`Invalid status. Valid statuses include: ${validStatuses.join(', ')}`);
  }

  const updated = await orderRepository.updateOrderStatus(orderId, finalStatus);
  if (!updated) {
    throw ApiError.notFound('This order was not found.');
  }
  return updated;
};

module.exports = { createOrder, getOrderById, getOrders, updateOrderStatus };