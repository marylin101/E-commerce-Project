const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { ROLES, buildUserDocument } = require('../models/User');
const {
  requireFields,
  requireValidEmail,
  requireValidObjectId,
  requireValidRole,
  handleDuplicateKeyError,
} = require('../utils/validators');

function collection() {
  return getDb().collection('users');
}

// expects passwordHash to already be hashed (bcrypt) by the caller
async function createUser({ name, email, passwordHash, role }) {
  requireFields({ name, email, passwordHash }, ['name', 'email', 'passwordHash']);
  requireValidEmail(email);
  requireValidRole(role || 'customer', ROLES);

  const doc = buildUserDocument({ name, email, passwordHash, role });

  try {
    const result = await collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  } catch (err) {
    handleDuplicateKeyError(err, 'Email');
  }
}

async function findUserById(id) {
  requireValidObjectId(id, 'userId');
  return collection().findOne({ _id: new ObjectId(id) });
}

async function findUserByEmail(email) {
  requireValidEmail(email);
  return collection().findOne({ email });
}

async function updateUser(id, updates) {
  requireValidObjectId(id, 'userId');
  if (updates.email) requireValidEmail(updates.email);
  if (updates.role) requireValidRole(updates.role, ROLES);

  try {
    return await collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
  } catch (err) {
    handleDuplicateKeyError(err, 'Email');
  }
}

async function deleteUser(id) {
  requireValidObjectId(id, 'userId');
  const result = await collection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = { createUser, findUserById, findUserByEmail, updateUser, deleteUser };
