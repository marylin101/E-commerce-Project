const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const ApiError = require('../utils/ApiError');

const populateCart = async (cart) => {
  if (!cart) return { items: [] };
  const items = cart.items || [];
  const populatedItems = await Promise.all(
    items.map(async (item) => {
      let product = null;
      if (item.productId) {
        try {
          product = await productRepository.findProductById(item.productId.toString());
        } catch (e) {
          product = null;
        }
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtAdd: item.priceAtAdd,
        product: product || null,
        name: product ? product.name : 'Product',
        price: product ? product.price : (item.priceAtAdd || 0),
        images: product ? product.images : [],
        stockQty: product ? product.stockQty : 0
      };
    })
  );
  return { ...cart, items: populatedItems };
};

const getCart = async (userId) => {
  const cart = await cartRepository.getCart(userId);
  return await populateCart(cart);
};

const addItem = async (firstArg, secondArg, thirdArg) => {
  let userId, productId, quantity;
  if (typeof firstArg === 'object' && firstArg !== null) {
    userId = firstArg.userId;
    productId = firstArg.productId;
    quantity = firstArg.quantity;
  } else {
    userId = firstArg;
    productId = secondArg;
    quantity = thirdArg;
  }

  const numQty = Number(quantity);
  if (!productId || !quantity || Number.isNaN(numQty) || numQty < 1) {
    const reason = !productId
      ? 'The product ID is required.'
      : (!quantity ? 'Please enter a valid quantity.' : 'The quantity must be 1 or greater.');
    throw ApiError.badRequest(reason);
  }

  const product = await productRepository.findProductById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found.');
  }

  if (product.stockQty < numQty) {
    throw ApiError.badRequest(`Insufficient stock for "${product.name}". Only ${product.stockQty} available.`);
  }

  const updatedCart = await cartRepository.addItem(userId, {
    productId,
    quantity: numQty,
    priceAtAdd: product.price,
  });
  return await populateCart(updatedCart);
};

const updateItem = async (firstArg, secondArg, thirdArg) => {
  let userId, productId, quantity;
  if (typeof firstArg === 'object' && firstArg !== null) {
    userId = firstArg.userId;
    productId = firstArg.productId;
    quantity = firstArg.quantity;
  } else {
    userId = firstArg;
    productId = secondArg;
    quantity = thirdArg;
  }

  const numQty = Number(quantity);
  if (Number.isNaN(numQty) || numQty < 1) {
    throw ApiError.badRequest('The product quantity must be at least 1.');
  }

  const product = await productRepository.findProductById(productId);
  if (product && product.stockQty < numQty) {
    throw ApiError.badRequest(`Insufficient stock for "${product.name}". Only ${product.stockQty} available.`);
  }

  const updatedItem = await cartRepository.updateQuantity(userId, productId, numQty);
  if (!updatedItem) {
    throw ApiError.notFound('The product was not found in the cart.');
  }
  return await populateCart(updatedItem);
};

const removeItem = async (firstArg, secondArg) => {
  let userId, productId;
  if (typeof firstArg === 'object' && firstArg !== null) {
    userId = firstArg.userId;
    productId = firstArg.productId;
  } else {
    userId = firstArg;
    productId = secondArg;
  }

  const removedItem = await cartRepository.removeItem(userId, productId);
  return await populateCart(removedItem);
};

module.exports = { getCart, addItem, updateItem, removeItem };
