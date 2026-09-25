const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildReviewDocument } = require('../models/Review');
const { requireFields, requireValidObjectId, requireRatingInRange, handleDuplicateKeyError } = require('../utils/validators');

function collection() {
  return getDb().collection('reviews');
}

async function createReview({ productId, userId, rating, comment = '' }) {
  requireFields({ productId, userId, rating }, ['productId', 'userId', 'rating']);
  requireValidObjectId(productId, 'productId');
  requireValidObjectId(userId, 'userId');
  requireRatingInRange(rating);

  const doc = buildReviewDocument({
    productId: new ObjectId(productId),
    userId: new ObjectId(userId),
    rating,
    comment,
  });

  try {
    const result = await collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  } catch (error) {
    handleDuplicateKeyError(error, 'Review for this product by the same user already exists');
  }
}

async function getReview(productID) {
  requireValidObjectId(productID, 'productId');
  return collection().find({ productId: new ObjectId(productID) }).sort({ createdAt: -1 }).toArray();
}

module.exports = { createReview, getReview, getReviewsByProductId: getReview };

