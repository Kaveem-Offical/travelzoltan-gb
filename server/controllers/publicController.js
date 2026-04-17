const { VisaConfiguration, Application } = require('../models');

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
    const { configuration_id, user_data } = req.body;

    if (!configuration_id) {
      return res.status(400).json({ message: 'configuration_id is required.' });
    }

    // Process file uploads from multer
    const documentUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Storing the relative path
        documentUrls.push(`/uploads/${file.filename}`);
      });
    }

    let parsedUserData = {};
    if (user_data) {
      try {
        parsedUserData = typeof user_data === 'string' ? JSON.parse(user_data) : user_data;
      } catch (e) {
        return res.status(400).json({ message: 'Invalid user_data JSON format' });
      }
    }

    const newApplication = await Application.create({
      configuration_id,
      user_data: parsedUserData,
      document_urls: documentUrls,
      payment_status: 'pending' // Default status
    });

    return res.status(201).json({
      message: 'Application created successfully',
      applicationId: newApplication.id
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/payments/create-intent
const createPaymentIntent = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: 'applicationId is required.' });
    }

    const application = await Application.findByPk(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // MOCK Payment Gateway logic
    // In a real app, you'd call Stripe/Razorpay and send client secret
    
    // Simulating instant payment success for the mock
    application.payment_status = 'completed';
    await application.save();

    return res.status(200).json({
      message: 'Payment processed successfully',
      applicationId: application.id,
      status: 'completed'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getVisaRequirements,
  createApplication,
  createPaymentIntent
};
