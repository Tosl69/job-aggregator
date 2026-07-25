const express = require('express');
const router = express.Router();
const { getUsers, updateRole, getAllWidgets, removeWidget } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/users', auth, isAdmin, getUsers);
router.patch('/users/:id/role', auth, isAdmin, updateRole);
router.get('/widgets', auth, isAdmin, getAllWidgets);
router.delete('/widgets/:id', auth, isAdmin, removeWidget);

module.exports = router;