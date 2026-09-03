const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { authenticate} = require('../middleware/authMiddleware');
const requreAdmin = require('../middleware/requireAdmin');
const validator = require('../utils/validators');

router.post('/', authenticate, requreAdmin, validator('createProduct'), productController.createProduct);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', authenticate, requreAdmin, validator('updateProduct'), productController.updateProduct);
router.delete('/:id', authenticate, requreAdmin, productController.deleteProduct);

//review routes
router.post('/reviews/:id/reviews', authenticate, validator('createReview'), reviewController.createReview);
router.get('/reviews/:id/reviews', reviewController.getReviewsById);
module.exports = router;