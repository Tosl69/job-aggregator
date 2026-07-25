const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');

router.post('/register', rateLimiter, register);
router.post('/login', rateLimiter, login);
router.post('/logout', logout);
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;