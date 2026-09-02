const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildAddressDocument } = require('../models/Address');
const { requireFields, requireValidObjectId } = require('../utils/validators');

function collection() {
  return getDb().collection('addresses');
}

async function createReview({ productId, userId, rating, comment = '' }) {
//create review function
}

async function getReview() {
 //get review function
}

module.exports = { createReview, getReview };
