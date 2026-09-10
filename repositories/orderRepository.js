const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { ORDER_STATUSES, buildOrderDocument } = require('../models/Order');
const { ValidationError, requireFields, requireValidObjectId, requireNonNegativeNumber, requireValidStatus } = require('../utils/validators');


function collection() {
  return getDb().collection('orders');
}

async function createOrder({ userId, addressId, items, totalAmount, paymentRef = null }) {
requireFields({ userId, addressId, items, totalAmount });
requireValidObjectId(userId, 'userId');
requireValidObjectId(addressId, 'addressId');
requireNonNegativeNumber(totalAmount, 'totalAmount');

if (!Array.isArray(items) || items.length === 0) {
  throw new ValidationError('Order must contain at least one item');
}

const doc = buildOrderDocument({ userId: newObjectId(userId), 
  addressId: new ObjectId(addressId),
  items: items.map((item)=>({...item, productId: new ObjectId(item.productId)})), 
  totalAmount, paymentRef 
});

const result = await collection().insertOne(doc);
return { _id: result.insertedId, ...doc };
}

async function findOrderById(id) {
  requireValidObjectId(id, 'orderId');
  return collection().findOne({ _id: new ObjectId(id) });
}

async function findOrderByUserId(userId) {
  requireValidObjectId(userId, 'userId');
  return collection().find({ userId: new ObjectId(userId) }).toArray();
}

async function updateOrderStatus(id, status) {
requiredValidObjectId(id, 'orderId');
requireValidStatus(status, ORDER_STATUSES, 'status');
return collection().findOneAndUpdate(
  { _id: new ObjectId(id) },
  { $set: { status } },
  { returnDocument: 'after' }
);
}


module.exports = { createOrder, findOrderByUserId, findOrderById, updateOrderStatus};
