const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { mockAdminAuth } = require('../middlewares/auth');

// Apply mock authentication to all admin routes
router.use(mockAdminAuth);

router.get('/applications', adminController.getAllApplications);
router.get('/configurations', adminController.getAllConfigurations);
router.put('/configurations/:id', adminController.updateConfiguration);

module.exports = router;
