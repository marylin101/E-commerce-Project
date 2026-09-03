const orderService = require('../services/orderService');
const {sucResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderData = req.body;
  const order = await orderService.createOrder(userId, orderData);
  return sucResponse(res, { order }, 201);
});

const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await orderService.getOrders(userId);
  return sucResponse(res, { orders }, 200);
});

const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;
  const order = await orderService.getOrderById(userId, orderId);
  return sucResponse(res, { order }, 200);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;
    const { status } = req.body;
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
    return sucResponse(res, { updatedOrder }, 200);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;
  await orderService.deleteOrder(userId, orderId);
  return sucResponse(res, { message: 'Order deleted successfully' }, 200);
});

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder };