const { VisaConfiguration, Application } = require('../models');

// GET /api/admin/applications
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: VisaConfiguration,
          as: 'visaConfiguration',
          attributes: ['citizenship', 'destination', 'service_fee']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/admin/configurations
const getAllConfigurations = async (req, res) => {
  try {
    const configurations = await VisaConfiguration.findAll();
    return res.status(200).json(configurations);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/admin/configurations/:id
const updateConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_fee, required_documents, form_schema } = req.body;

    const configuration = await VisaConfiguration.findByPk(id);

    if (!configuration) {
      return res.status(404).json({ message: 'Visa configuration not found.' });
    }

    if (service_fee !== undefined) configuration.service_fee = service_fee;
    if (required_documents !== undefined) configuration.required_documents = required_documents;
    if (form_schema !== undefined) configuration.form_schema = form_schema;

    await configuration.save();

    return res.status(200).json({
      message: 'Configuration updated successfully',
      configuration
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllApplications,
  getAllConfigurations,
  updateConfiguration
};
