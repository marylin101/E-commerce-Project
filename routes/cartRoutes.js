const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);
router.post('/items', cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/:item/:productId', cartController.updateCartItem);
router.delete('/:item/:productId', cartController.removeCartItem);

module.exports = router;