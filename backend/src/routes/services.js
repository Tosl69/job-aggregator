const express = require('express');
const router = express.Router();
const { getServices, getServiceData } = require('../controllers/serviceController');
const auth = require('../middleware/auth');

router.get('/', auth, getServices);
router.get('/:serviceId/:widgetType', auth, getServiceData);

module.exports = router;