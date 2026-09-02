const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildAddressDocument } = require('../models/Address');
const { requireFields, requireValidObjectId } = require('../utils/validators');

function collection() {
  return getDb().collection('addresses');
}

async function createOrder({ userId, addressId, items, totalAmount, paymentRef = null }) {
//create order function
}

async function findOrdersByUserId(userId) {
  requireValidObjectId(id, 'addressId');
  return collection().findOne({ _id: new ObjectId(id) });
}

async function findOrderById(id) {
  requireValidObjectId(userId, 'userId');
  return collection().find({ userId: new ObjectId(userId) }).toArray();
}

async function updateOrderStatus(id, updates) {
//update order status function
}

module.exports = { createOrder, findOrdersByUserId, findOrderById, updateOrderStatus };
