const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authMiddleware');
const {requireAdmin} = require('../middleware/roleMiddleware');

router.use(authenticate);
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);
router.delete('/:id', requireAdmin, orderController.deleteOrder);

module.exports = router;