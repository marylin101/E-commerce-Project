const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildAddressDocument } = require('../models/Address');
const { requireFields, requireValidObjectId } = require('../utils/validators');

function collection() {
  return getDb().collection('addresses');
}

async function createAddress({ userId, line1, city, province, postalCode }) {
  requireValidObjectId(userId, 'userId');
  requireFields({ line1, city, province, postalCode }, ['line1', 'city', 'province', 'postalCode']);

  const doc = buildAddressDocument({ userId: new ObjectId(userId), line1, city, province, postalCode });
  const result = await collection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

async function findAddressById(id) {
  requireValidObjectId(id, 'addressId');
  return collection().findOne({ _id: new ObjectId(id) });
}

async function findAddressesByUserId(userId) {
  requireValidObjectId(userId, 'userId');
  return collection().find({ userId: new ObjectId(userId) }).toArray();
}

async function updateAddress(id, updates) {
  requireValidObjectId(id, 'addressId');
  return collection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
}

async function deleteAddress(id) {
  requireValidObjectId(id, 'addressId');
  const result = await collection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = { createAddress, findAddressById, findAddressesByUserId, updateAddress, deleteAddress };
