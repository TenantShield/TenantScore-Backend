const express = require('express');
const { authenticateToken, ensureAdmin, ensureAccountOwner } = require('../middleware/authMiddleware');
const { registerUser, loginUser, updatePassword, forcePasswordChange } = require('../controllers/userController');

const router = express.Router();

router.post('/register', authenticateToken, ensureAdmin, registerUser);
router.put('/:userId/change-password', authenticateToken, ensureAccountOwner, updatePassword);
router.post('/set-new-password',forcePasswordChange);
router.post('/login', loginUser);

module.exports = router;
