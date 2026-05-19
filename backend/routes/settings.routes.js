const express = require('express');
const router = express.Router();
const { getGlobalSettings, updateGlobalSettings } = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', authorize('admin'), getGlobalSettings);
router.put('/', authorize('admin'), updateGlobalSettings);

module.exports = router;
