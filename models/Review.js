function buildReviewDocument({ productId, userId, rating, comment = '' }) {
  return { productId, userId, rating, comment, createdAt: new Date() };
}

module.exports = { buildReviewDocument };
