const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { ORDER_STATUSES, buildOrderDocument } = require('../models/Order');
const {
  ValidationError,
  requireFields,
  requireValidObjectId,
  requireNonNegativeNumber,
  requireValidStatus,
} = require('../utils/validators');

function collection() {
  return getDb().collection('orders');
}

async function createOrder({ userId, addressId, items, totalAmount, paymentRef = null }) {
  requireFields({ userId, items, totalAmount }, ['userId', 'items', 'totalAmount']);
  requireValidObjectId(userId, 'userId');
  requireNonNegativeNumber(totalAmount, 'totalAmount');

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('Order must contain at least one item');
  }

  const doc = buildOrderDocument({
    userId: new ObjectId(userId),
    addressId: (addressId && ObjectId.isValid(addressId)) ? new ObjectId(addressId) : addressId || 'default',
    items: items.map((item) => ({
      ...item,
      productId: (item.productId && ObjectId.isValid(item.productId)) ? new ObjectId(item.productId) : item.productId,
    })),
    totalAmount,
    paymentRef,
  });

  const result = await collection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

async function findOrderById(id) {
  requireValidObjectId(id, 'orderId');
  return collection().findOne({ _id: new ObjectId(id) });
}

async function findOrdersByUserId(userId) {
  requireValidObjectId(userId, 'userId');
  return collection().find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
}

async function getAllOrders() {
  return collection().find({}).sort({ createdAt: -1 }).toArray();
}

async function updateOrderStatus(id, status) {
  requireValidObjectId(id, 'orderId');
  requireValidStatus(status, ORDER_STATUSES, 'status');
  const result = await collection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status } },
    { returnDocument: 'after' }
  );
  return result.value || result;
}

module.exports = {createOrder, findOrderByUserId: findOrdersByUserId, findOrdersByUserId, findOrderById, findById: findOrderById, getAllOrders, updateOrderStatus,};

