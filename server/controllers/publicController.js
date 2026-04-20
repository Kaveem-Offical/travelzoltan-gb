const { VisaConfiguration, Application, Document } = require('../models');
const uploadService = require('../services/uploadService');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// GET /api/visa-requirements?citizenship=X&destination=Y
const getVisaRequirements = async (req, res) => {
  try {
    const { citizenship, destination } = req.query;

    if (!citizenship || !destination) {
      return res.status(400).json({ message: 'Citizenship and destination are required parameters.' });
    }

    const config = await VisaConfiguration.findOne({
      where: { citizenship, destination }
    });

    if (!config) {
      return res.status(404).json({ message: 'Visa configuration not found for this route.' });
    }

    return res.status(200).json({
      service_fee: config.service_fee,
      required_documents: config.required_documents,
      form_schema: config.form_schema,
      configuration_id: config.id
    });
  } catch (error) {
    console.error('Error fetching visa requirements:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { configuration_id, user_data, document_types } = req.body;

    if (!configuration_id) {
      return res.status(400).json({ message: 'configuration_id is required.' });
    }

    let parsedUserData = {};
    if (user_data) {
      try {
        parsedUserData = typeof user_data === 'string' ? JSON.parse(user_data) : user_data;
      } catch (e) {
        return res.status(400).json({ message: 'Invalid user_data JSON format' });
      }
    }

    // Parse document types if provided
    let parsedDocumentTypes = [];
    if (document_types) {
      try {
        parsedDocumentTypes = typeof document_types === 'string' ? JSON.parse(document_types) : document_types;
      } catch (e) {
        console.warn('Invalid document_types format, using defaults');
      }
    }

    // Create application first
    const newApplication = await Application.create({
      configuration_id,
      user_data: parsedUserData,
      document_urls: [], // Deprecated field, keeping for backward compatibility
      payment_status: 'pending'
    });

    // Upload documents if provided
    const uploadedDocuments = [];
    if (req.files && req.files.length > 0) {
      try {
        console.log(`[Application] Uploading ${req.files.length} documents...`);
        
        // Upload each file with its document type
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const documentType = parsedDocumentTypes[i] || `document_${i + 1}`;
          
          try {
            // Upload with fallback logic
            const uploadResult = await uploadService.uploadDocument(file, documentType);
            
            // Save document record to database
            const document = await Document.create({
              application_id: newApplication.id,
              document_type: documentType,
              file_url: uploadResult.file_url,
              storage_type: uploadResult.storage_type,
              file_name: uploadResult.file_name,
              mime_type: uploadResult.mime_type,
              file_size: uploadResult.file_size,
              drive_file_id: uploadResult.drive_file_id || null,
              cloudinary_public_id: uploadResult.cloudinary_public_id || null
            });
            
            uploadedDocuments.push({
              id: document.id,
              document_type: documentType,
              file_name: uploadResult.file_name,
              storage_type: uploadResult.storage_type
            });
            
            console.log(`[Application] Document ${i + 1} uploaded: ${uploadResult.storage_type}`);
          } catch (uploadError) {
            console.error(`[Application] Failed to upload document ${i + 1}:`, uploadError.message);
            // Continue with other files even if one fails
          }
        }
        
        console.log(`[Application] Successfully uploaded ${uploadedDocuments.length}/${req.files.length} documents`);
      } catch (error) {
        console.error('[Application] Document upload error:', error);
        // Don't fail the entire application if document upload fails
      }
    }

    return res.status(201).json({
      message: 'Application created successfully',
      applicationId: newApplication.id,
      documentsUploaded: uploadedDocuments.length,
      documents: uploadedDocuments
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// POST /api/payments/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: 'applicationId is required.' });
    }

    const application = await Application.findByPk(applicationId, {
      include: [{ model: VisaConfiguration, as: 'configuration' }]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Calculate amount from configuration (convert to paise for INR)
    const config = application.configuration;
    let amount = 50000; // Default 500 INR in paise
    
    if (config && config.service_fee) {
      const fee = config.service_fee;
      if (typeof fee === 'object') {
        const total = (fee.admin_fee || 0) + (fee.service_fee || 0) + (fee.express_fee || 0);
        amount = Math.round(total * 100); // Convert to paise (smallest currency unit)
      } else {
        amount = Math.round(parseFloat(fee) * 100);
      }
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount,
      currency: 'INR',
      receipt: `app_${applicationId}`,
      notes: {
        application_id: applicationId,
        user_email: application.user_data?.email || ''
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      applicationId: application.id
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { applicationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!applicationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification fields.' });
    }

    const application = await Application.findByPk(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Verify signature
    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      application.payment_status = 'completed';
      application.payment_id = razorpay_payment_id;
      application.order_id = razorpay_order_id;
      await application.save();

      return res.status(200).json({
        message: 'Payment verified successfully',
        applicationId: application.id,
        paymentId: razorpay_payment_id,
        status: 'completed'
      });
    } else {
      application.payment_status = 'failed';
      await application.save();

      return res.status(400).json({
        message: 'Payment verification failed',
        status: 'failed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Legacy endpoint - redirects to create order
const createPaymentIntent = async (req, res) => {
  return createPaymentOrder(req, res);
};

module.exports = {
  getVisaRequirements,
  createApplication,
  createPaymentIntent,
  createPaymentOrder,
  verifyPayment
};
