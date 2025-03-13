const express = require('express');
const { authenticateToken, ensureAdmin, ensureAccountOwner } = require('../middleware/authMiddleware');
const { registerUser, loginUser, updatePassword } = require('../controllers/userController');

const router = express.Router();

router.post('/register', authenticateToken, ensureAdmin, registerUser);
router.put('/:userId/password', authenticateToken, ensureAccountOwner, updatePassword);
router.post('/login', loginUser);

module.exports = router;
