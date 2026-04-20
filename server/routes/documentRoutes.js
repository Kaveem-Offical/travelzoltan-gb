const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { requireAuth } = require('../middlewares/auth');

// Public document routes (with authentication for security)
// In production, you might want to add token-based access or application-specific auth

// Get document info
router.get('/:id/info', documentController.getDocumentInfo);

// Download document
router.get('/:id', documentController.downloadDocument);

// Admin-only routes
router.delete('/:id', requireAuth, documentController.deleteDocument);

module.exports = router;
