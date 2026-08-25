const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const liveApprovalController = require('../controllers/liveApprovalController');
const upload = require('../middlewares/upload');

// Public endpoints
router.get('/visa-options', publicController.getVisaOptions);
router.get('/visa-requirements', publicController.getVisaRequirements);
router.get('/live-approvals', liveApprovalController.getPublicApprovals);

// Form handling with multer - 'documents' is the field name for files
router.post('/applications', upload.array('documents'), publicController.createApplication);
router.put('/applications/:id', publicController.updateApplication);
router.post('/applications/:id/documents', upload.array('documents'), publicController.uploadApplicationDocuments);

router.post('/payments/create-intent', publicController.createPaymentIntent);
router.post('/payments/create-order', publicController.createPaymentOrder);
router.post('/payments/verify', publicController.verifyPayment);

module.exports = router;
