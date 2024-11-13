const express = require('express');
const router = express.Router();
const { authController } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/logout', authController.logout);
router.post('/create-account', authMiddleware, authController.createAccount);
router.post('/refresh', authController.refresh);

module.exports = router;

