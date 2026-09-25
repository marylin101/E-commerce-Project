const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { validateRegister, validateLogin } = require('../validators/authValidators');

router.post('/register', validateRequest(validateRegister), authController.register);
router.post('/login', validateRequest(validateLogin), authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
