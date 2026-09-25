function validateCreateReview(body) {
  const errors = [];
  const { rating, comment } = body;

  if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
    errors.push('Rating must be a number between 1 and 5.');
  }
  if (comment !== undefined && (typeof comment !== 'string' || comment.length > 1000)) {
    errors.push('Comment must be text no longer than 1000 characters.');
  }

  return errors;
}

module.exports = { validateCreateReview };
