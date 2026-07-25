const express = require('express');
const router = express.Router();
const { getUserWidgets, addWidget, editWidget, removeWidget } = require('../controllers/widgetController');
const auth = require('../middleware/auth');

router.get('/', auth, getUserWidgets);
router.post('/', auth, addWidget);
router.put('/:id', auth, editWidget);
router.delete('/:id', auth, removeWidget);

module.exports = router;