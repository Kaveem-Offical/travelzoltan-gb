const { VisaConfiguration, Application, Document, sequelize } = require('../models');
const uploadService = require('../services/uploadService');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// GET /api/visa-options - Get unique citizenships and destinations
const getVisaOptions = async (req, res) => {
  try {
    console.log('[getVisaOptions] Fetching unique citizenships and destinations...');

    // Get all configurations and extract unique values
    const allConfigs = await VisaConfiguration.findAll({
      attributes: ['citizenship', 'destination'],
      raw: true
    });

    console.log('[getVisaOptions] Total configs found:', allConfigs.length);
    console.log('[getVisaOptions] First few configs:', allConfigs.slice(0, 3));

    // Extract unique values using Set and trim whitespace to prevent duplicates
    const citizenshipsSet = new Set(allConfigs.map(c => c.citizenship ? c.citizenship.trim() : null).filter(Boolean));
    const destinationsSet = new Set(allConfigs.map(c => c.destination ? c.destination.trim() : null).filter(Boolean));

    const citizenships = Array.from(citizenshipsSet).sort();
    const destinations = Array.from(destinationsSet).sort();

    console.log('[getVisaOptions] Parsed citizenships:', citizenships);
    console.log('[getVisaOptions] Parsed destinations:', destinations);

    return res.status(200).json({
      citizenships,
      destinations
    });
  } catch (error) {
    console.error('[getVisaOptions] Error fetching visa options:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const defaultRequiredDocs = {
  tourist: {
    student: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Student ID card", description: "Valid student identification." },
        { icon: "school", name: "CAS Letter", description: "Confirmation of Acceptance for Studies." },
        { icon: "flight", name: "Flight Itinerary", description: "Round trip flight reservation." },
        { icon: "hotel", name: "Hotel Booking", description: "Proof of accommodation." }
      ],
      query: []
    },
    employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Employee ID card", description: "Valid employee identification." },
        { icon: "work", name: "Employment Contract", description: "Valid contract from your employer." },
        { icon: "flight", name: "Flight Itinerary", description: "Round trip flight reservation." },
        { icon: "hotel", name: "Hotel Booking", description: "Proof of accommodation." }
      ],
      query: []
    },
    self_employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "handshake", name: "Business Registration", description: "Proof of business registration." },
        { icon: "account_balance", name: "Business Bank Statement", description: "Last 6 months business bank statement." },
        { icon: "flight", name: "Flight Itinerary", description: "Round trip flight reservation." },
        { icon: "hotel", name: "Hotel Booking", description: "Proof of accommodation." }
      ],
      query: []
    },
    unemployed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "person_off", name: "Sponsorship Letter", description: "Letter from your sponsor." },
        { icon: "badge", name: "Sponsor's ID Proof", description: "Passport or Resident permit of sponsor." },
        { icon: "flight", name: "Flight Itinerary", description: "Round trip flight reservation." },
        { icon: "hotel", name: "Hotel Booking", description: "Proof of accommodation." }
      ],
      query: []
    }
  },
  visiting: {
    student: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Student ID card", description: "Valid student identification." },
        { icon: "school", name: "CAS Letter", description: "Confirmation of Acceptance for Studies." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." }
      ],
      query: []
    },
    employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Employee ID card", description: "Valid employee identification." },
        { icon: "work", name: "Employment Contract", description: "Valid contract from your employer." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." }
      ],
      query: []
    },
    self_employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "handshake", name: "Business Registration", description: "Proof of business registration." },
        { icon: "account_balance", name: "Business Bank Statement", description: "Last 6 months business bank statement." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." }
      ],
      query: []
    },
    unemployed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "person_off", name: "Sponsorship Letter", description: "Letter from your sponsor." },
        { icon: "badge", name: "Sponsor's ID Proof", description: "Passport or Resident permit of sponsor." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." }
      ],
      query: []
    }
  },
  business: {
    student: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Student ID card", description: "Valid student identification." },
        { icon: "school", name: "CAS Letter", description: "Confirmation of Acceptance for Studies." },
        { icon: "business_center", name: "Business Invitation Letter", description: "Official invitation from the host company or conference organiser." },
        { icon: "receipt", name: "Conference / Event Registration", description: "Proof of registration for the business event or conference." }
      ],
      query: []
    },
    employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Employee ID card", description: "Valid employee identification." },
        { icon: "work", name: "Employment Letter", description: "Letter from employer authorising business travel." },
        { icon: "business_center", name: "Business Invitation Letter", description: "Official invitation from the host company or conference organiser." },
        { icon: "account_balance", name: "Business Bank Statement", description: "Last 3 months bank statement showing financial solvency." }
      ],
      query: []
    },
    self_employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "handshake", name: "Business Registration", description: "Proof of business registration or trade licence." },
        { icon: "account_balance", name: "Business Bank Statement", description: "Last 6 months business bank statement." },
        { icon: "business_center", name: "Business Invitation Letter", description: "Official invitation from the host company or conference organiser." },
        { icon: "receipt", name: "Company Profile / Letter", description: "Official company letterhead confirming the purpose of travel." }
      ],
      query: []
    },
    unemployed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "person_off", name: "Sponsorship Letter", description: "Letter from your sponsor authorising business travel." },
        { icon: "badge", name: "Sponsor's ID Proof", description: "Passport or Resident permit of sponsor." },
        { icon: "business_center", name: "Business Invitation Letter", description: "Official invitation from the host company or conference organiser." },
        { icon: "account_balance", name: "Sponsor's Bank Statement", description: "Last 3 months bank statement from sponsor." }
      ],
      query: []
    }
  }
};

const normalizeRequiredDocs = (docs) => {
  const normalized = JSON.parse(JSON.stringify(defaultRequiredDocs));
  if (!docs || typeof docs !== 'object') {
    return normalized;
  }
  
  const hasNewKeys = ['tourist', 'visiting', 'business'].some(vk => 
    docs[vk] && typeof docs[vk] === 'object' && 
    ['student', 'employed', 'self_employed', 'unemployed'].some(ac => docs[vk][ac])
  );
  
  if (hasNewKeys) {
    ['tourist', 'visiting', 'business'].forEach(vk => {
      if (docs[vk] && typeof docs[vk] === 'object') {
        ['student', 'employed', 'self_employed', 'unemployed'].forEach(ac => {
          if (docs[vk][ac] && typeof docs[vk][ac] === 'object') {
            normalized[vk][ac].now = Array.isArray(docs[vk][ac].now) ? docs[vk][ac].now : [];
            normalized[vk][ac].later = Array.isArray(docs[vk][ac].later) ? docs[vk][ac].later : [];
            normalized[vk][ac].query = Array.isArray(docs[vk][ac].query) ? docs[vk][ac].query : [];
          }
        });
      }
    });
    return normalized;
  }

  let oldNow = [];
  if (Array.isArray(docs.documents_required_now)) {
    oldNow = docs.documents_required_now;
  } else if (Array.isArray(docs.core_documents)) {
    oldNow = docs.core_documents;
  }
  
  ['tourist', 'visiting', 'business'].forEach(vk => {
    ['student', 'employed', 'self_employed', 'unemployed'].forEach(ac => {
      normalized[vk][ac].now = JSON.parse(JSON.stringify(oldNow));
    });
  });

  if (docs.required_later && typeof docs.required_later === 'object') {
    const requiredLater = docs.required_later;
    ['student', 'employed', 'self_employed', 'unemployed'].forEach(ac => {
      if (requiredLater[ac] && typeof requiredLater[ac] === 'object') {
        ['tourist', 'visiting', 'business'].forEach(vk => {
          if (Array.isArray(requiredLater[ac][vk])) {
            normalized[vk][ac].later = requiredLater[ac][vk];
          }
        });
      }
    });

    if (requiredLater.applicant_category && typeof requiredLater.applicant_category === 'object') {
      const appCat = requiredLater.applicant_category;
      ['student', 'employed', 'self_employed', 'unemployed'].forEach(ac => {
        if (Array.isArray(appCat[ac])) {
          ['tourist', 'visiting', 'business'].forEach(vk => {
            normalized[vk][ac].later = [...normalized[vk][ac].later, ...appCat[ac]];
          });
        }
      });
    }

    if (requiredLater.visa_category && typeof requiredLater.visa_category === 'object') {
      const visaCat = requiredLater.visa_category;
      ['tourist', 'visiting', 'business'].forEach(vk => {
        if (Array.isArray(visaCat[vk])) {
          ['student', 'employed', 'self_employed', 'unemployed'].forEach(ac => {
            normalized[vk][ac].later = [...normalized[vk][ac].later, ...visaCat[vk]];
          });
        }
      });
    }
  }

  return normalized;
};

const DEFAULT_VISA_REQUIREMENTS = {
  service_fee: {
    admin_fee: 30,
    express_fee: 30,
    service_fee: 90
  },
  required_documents: defaultRequiredDocs,
  form_schema: {},
  configuration_id: 1,
  is_default: true
};

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

    if (!config || !config.required_documents) {
      return res.status(200).json(DEFAULT_VISA_REQUIREMENTS);
    }

    return res.status(200).json({
      service_fee: config.service_fee,
      required_documents: normalizeRequiredDocs(config.required_documents),
      form_schema: config.form_schema,
      configuration_id: config.id,
      is_default: false
    });
  } catch (error) {
    console.error('Error fetching visa requirements:', error);
    return res.status(200).json(DEFAULT_VISA_REQUIREMENTS);
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
    const { applicationId, currency = 'GBP', paymentOption = 'partial' } = req.body;
    console.log('[createPaymentOrder] Received applicationId:', applicationId, 'currency:', currency, 'paymentOption:', paymentOption);

    if (!applicationId) {
      return res.status(400).json({ message: 'applicationId is required.' });
    }

    console.log('[createPaymentOrder] Looking up application with ID:', applicationId);
    const application = await Application.findByPk(applicationId, {
      include: [{ model: VisaConfiguration, as: 'visaConfiguration' }]
    });

    if (!application) {
      console.log('[createPaymentOrder] Application not found for ID:', applicationId);
      return res.status(404).json({ message: 'Application not found.' });
    }

    console.log('[createPaymentOrder] Found application:', application.id);

    // Exchange rates relative to GBP (base configuration currency)
    const EXCHANGE_RATES = {
      GBP: 1.0,
      USD: 1.30,
      EUR: 1.18,
      INR: 108.0
    };

    // Calculate amount from configuration
    const config = application.visaConfiguration;
    console.log('[createPaymentOrder] Visa config:', config ? 'found' : 'not found');
    
    let amountGBP = 130; // default total
    if (config && config.service_fee) {
      const fee = config.service_fee;
      if (typeof fee === 'object') {
        if (paymentOption === 'partial') {
          amountGBP = fee.pay_now_amount || (fee.total_amount ? fee.total_amount / 2 : 65);
        } else {
          amountGBP = fee.pay_in_full_amount || (fee.total_amount ? fee.total_amount * 0.7 : 91);
        }
      } else {
        const total = parseFloat(fee) || 130;
        amountGBP = paymentOption === 'partial' ? total / 2 : total * 0.7;
      }
    }

    const rate = EXCHANGE_RATES[currency.toUpperCase()] || 1.0;
    const amountConverted = amountGBP * rate;
    const amountSmallestUnit = Math.round(amountConverted * 100);

    console.log('[createPaymentOrder] Calculated amount in GBP:', amountGBP, 'Converted to:', currency, 'Amount:', amountConverted, 'Smallest Unit:', amountSmallestUnit);

    // Check Razorpay credentials
    const hasKeyId = !!process.env.RAZORPAY_KEY_ID;
    const hasKeySecret = !!process.env.RAZORPAY_KEY_SECRET;
    console.log('[createPaymentOrder] Razorpay credentials - key_id exists:', hasKeyId, 'key_secret exists:', hasKeySecret);

    // Create Razorpay order
    const orderOptions = {
      amount: amountSmallestUnit,
      currency: currency.toUpperCase(),
      receipt: `app_${applicationId}`,
      notes: {
        application_id: applicationId,
        user_email: application.user_data?.email || '',
        payment_option: paymentOption,
        base_currency: 'GBP',
        base_amount: amountGBP.toString()
      }
    };

    console.log('[createPaymentOrder] Creating Razorpay order with options:', JSON.stringify(orderOptions));
    const order = await razorpay.orders.create(orderOptions);
    console.log('[createPaymentOrder] Razorpay order created:', order.id);

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      applicationId: application.id
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
  getVisaOptions,
  getVisaRequirements,
  createApplication,
  createPaymentIntent,
  createPaymentOrder,
  verifyPayment
};
