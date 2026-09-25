const cartService = require('../services/cartService');
const asyncHandler = require('../utils/asyncHandler');
const { sucResponse } = require('../utils/apiResponse');

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  const cart = await cartService.addItem({ userId, productId, quantity });
  return sucResponse(res, {cart}, 201);
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cart = await cartService.getCart(userId);
  return sucResponse(res, {cart}, 200);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const productId = req.params.productId || req.body.productId;
  const {quantity} = req.body;
  const userId = req.user.id;
  const updatedCart = await cartService.updateItem( userId, productId, quantity );
  return sucResponse(res, {updatedCart}, 200);
});

const removeCartItem = asyncHandler(async (req, res) => {
  const productId = req.params.productId || req.body.productId;
  const userId = req.user.id;
  const updatedCart = await cartService.removeItem({ userId, productId });
  return sucResponse(res, {updatedCart}, 200);
});

module.exports = { addToCart, getCart, updateCartItem, removeCartItem };