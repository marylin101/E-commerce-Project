const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;
