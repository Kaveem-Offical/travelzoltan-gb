const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');

// ========== PUBLIC AUTH ROUTES (No authentication required) ==========

// Admin login
router.post('/login', authController.login);

// Verify credentials (for Basic Auth)
router.post('/verify-credentials', authController.verifyCredentials);

// Logout (client-side token removal)
router.post('/logout', authController.logout);

// ========== PROTECTED ADMIN ROUTES (Authentication required) ==========

// Apply authentication middleware to all routes below
router.use(requireAuth);

// Dashboard
router.get('/dashboard-stats', adminController.getDashboardStats);

// Applications
router.get('/applications', adminController.getAllApplications);
router.get('/applications/:id', adminController.getApplicationById);
router.put('/applications/:id/status', adminController.updateApplicationStatus);

// Payments
router.get('/payments', adminController.getAllPayments);
router.get('/payments/stats', adminController.getPaymentStats);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Configurations
router.get('/configurations', adminController.getAllConfigurations);
router.post('/configurations', adminController.createConfiguration);
router.put('/configurations/:id', adminController.updateConfiguration);
router.delete('/configurations/:id', adminController.deleteConfiguration);

module.exports = router;
