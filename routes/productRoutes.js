const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middleware/authMiddleware');
const {requireAdmin} = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { validateCreateProduct } = require('../validators/productValidators');
const { validateCreateReview } = require('../validators/reviewValidators');

router.post('/', authenticate, requireAdmin, validateRequest(validateCreateProduct), productController.createProduct);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', authenticate, requireAdmin,  productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

//review routes
router.post('/reviews/:id/reviews', authenticate, validateRequest(validateCreateReview), reviewController.createReview);
router.get('/reviews/:id/reviews', reviewController.getReviewsById);
module.exports = router;