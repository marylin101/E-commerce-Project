/**
 * routes/authRoutes.js
 * ------------------------------------------------------------------
 * Routes normally live in Member 1's territory, but this file is
 * included so Member 3's auth/security pieces can be demoed wired
 * together end to end: /api/auth/register, /api/auth/login, /api/auth/me
 * ------------------------------------------------------------------
 */
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
