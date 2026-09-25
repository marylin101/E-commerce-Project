const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { requireFields, requireValidObjectId, requireNonNegativeNumber } = require('../utils/validators');

function collection() {
  return getDb().collection('carts');
}

async function getCart(userId) {
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

  const existingCart = await collection().findOne({ userId: userObjectId });

  if (existingCart && existingCart.items && existingCart.items.some(item => item.productId.toString() === productId)) {
    const updated = await collection().findOneAndUpdate(
      { userId: userObjectId, 'items.productId': productObjectId },
      { $inc: { 'items.$.quantity': quantity }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return updated.value || updated;
  }

  const newItem = { productId: productObjectId, quantity, priceAtAdd };
  const updated = await collection().findOneAndUpdate(
    { userId: userObjectId },
    {
      $push: { items: newItem },
      $set: { updatedAt: new Date() },
      $setOnInsert: { userId: userObjectId },
    },
    { upsert: true, returnDocument: 'after' }
  );
  return updated.value || updated;
}

async function updateQuantity(userId, productId, quantity) {
  requireValidObjectId(userId, 'userId');
  requireValidObjectId(productId, 'productId');
  requireNonNegativeNumber(quantity, 'quantity');

  const updated = await collection().findOneAndUpdate(
    { userId: new ObjectId(userId), 'items.productId': new ObjectId(productId) },
    { $set: { 'items.$.quantity': quantity, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return updated.value || updated;
}

async function removeItem(userId, productId) {
  requireValidObjectId(userId, 'userId');
  requireValidObjectId(productId, 'productId');

  const updated = await collection().findOneAndUpdate(
    { userId: new ObjectId(userId) },
    {
      $pull: { items: { productId: new ObjectId(productId) } },
      $set: { updatedAt: new Date() },
    },
    { returnDocument: 'after' }
  );
  return updated.value || updated;
}

async function clearCart(userId) {
  requireValidObjectId(userId, 'userId');

  const updated = await collection().findOneAndUpdate(
    { userId: new ObjectId(userId) },
    { $set: { items: [], updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return updated.value || updated;
}

module.exports = { getCart, addItem, updateQuantity, removeItem, clearCart };

