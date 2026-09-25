const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.post('/add', cartController.addToCart);
router.put('/items/:productId', cartController.updateCartItem);
router.put('/item/:productId', cartController.updateCartItem);
router.delete('/items/:productId', cartController.removeCartItem);
router.delete('/item/:productId', cartController.removeCartItem);

module.exports = router;