const reviewService = require('../services/reviewService');
const asyncHandler = require('../utils/asyncHandler');
const { sucResponse } = require('../utils/apiResponse');

const createReview = asyncHandler(async (req, res) => {
    const productId = req.params.productId || req.params.id || req.body.productId;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const review = await reviewService.createReview({ productId, userId, rating, comment });
    sucResponse(res, {review}, 201);
});

const getReviewsById = asyncHandler(async (req, res) => {
    const id = req.params.productId || req.params.id;
    const reviews = await reviewService.getReviewsByProductId(id);
    sucResponse(res, {reviews}, 200);
});

module.exports = { createReview, getReviewsById };