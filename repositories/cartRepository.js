const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { requireFields, requireValidObjectId, requireNonNegativeNumber } = require('../utils/validators');

function collection() {
  return getDb().collection('carts');
}

async function getCart() {
  requireValidObjectId(userId, 'userId');
  const cart = await collection().findOne({ userId: new ObjectId(userId) });
  return cart || { userId: new ObjectId(userId), items: [], updatedAt: null };
}

async function addItem(userId, { productId, quantity, priceAtAdd }) {
  requireValidObjectId(userId, 'userId');
  requireFields({ productId, quantity, priceAtAdd }, ['productId', 'quantity', 'priceAtAdd']);
  requireValidObjectId(productId, 'productId');
  requireNonNegativeNumber(quantity, 'quantity');
  requireNonNegativeNumber(priceAtAdd, 'priceAtAdd');

  const userObjectId = new ObjectId(userId);
  const productObjectId = new ObjectId(productId);

  const incremented = await collection().findOneAndUpdate(
    { userId: userObjectId, 'items.productId': productObjectId },
    { $inc: { 'items.$.quantity': quantity } },
    { returnDocument: 'after' }
  );
  
  if (incremented.value) {
    return incremented.value;
  }

  return collection().findOneAndUpdate(
    { userId: userObjectId },
    { $set: { updatedAt: new Date() },
      $setOnInsert: { userId: userObjectId, items: [] },
    },
    { upsert: true, returnDocument: 'after' }
  );
}

async function updateQuantity(userId, productId, quantity) {
  requireValidObjectId(userId, 'userId');
  requireValidObjectId(productId, 'productId');
  requireNonNegativeNumber(quantity, 'quantity');

  return collection().findOneAndUpdate(
    { userId: new ObjectId(userId), 'items.productId': new ObjectId(productId) },
    { $set: { 'items.$.quantity': quantity } },
    { returnDocument: 'after' }
  );
}

async function removeItem(userId, productId) {
  requireValidObjectId(userId, 'userId');
  requireValidObjectId(productId, 'productId');

  return collection().findOneAndUpdate(
    { userId: new ObjectId(userId) },
    { $pull: { items: { productId: new ObjectId(productId) } }, 
    $set: { updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
}

async function clearCart(userId) {
  requireValidObjectId(userId, 'userId');

  return collection().findOneAndUpdate(
    { userId: new ObjectId(userId) },
    { $set: { items: [], updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
}


module.exports = { getCart, addItem, updateQuantity, removeItem, clearCart };
