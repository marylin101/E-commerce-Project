const reviewRepository = require('../repositories/reviewRepository');
const productRepository = require('../repositories/productRepository');
const { notFound, badReq } = require('../utils/badRequests');

const createReview = async (data) => {
    const ratingNum = Number(data.rating);
    if(!data.productId || !data.userId || data.rating===undefined || data.rating=== null){
        throw badReq('There are missing required fields: productId, userId, rating are required.');
    }
    if(Number.isNaN(ratingNum) ||ratingNum < 1 || ratingNum > 5){
        throw badReq('Rating must be a value between 1 and 5.');
    }
    const product = await productRepository.findProductById(data.productId);
    if(!product){
        throw notFound("Review for this product with ID " + data.productId + " was not found.");
    }
    const newReview = await reviewRepository.createReview({ ...data, rating: ratingNum });
    return newReview;
};

const getReviewsByProductId = async (productId) => {
    const product = await productRepository.findProductById(productId);
    if(!product){
        throw notFound("The product with the provided ID:" +productId+ " was not found.");
    }
    const reviews = await reviewRepository.getReview(productId);
    return reviews;
};

module.exports = { createReview, getReviewsByProductId };