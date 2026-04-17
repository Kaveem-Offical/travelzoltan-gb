const { VisaConfiguration, Application, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper function to calculate total fee from breakdown
const calculateTotalFee = (serviceFee) => {
  if (typeof serviceFee === 'object' && serviceFee !== null) {
    return (serviceFee.admin_fee || 0) + (serviceFee.service_fee || 0) + (serviceFee.express_fee || 0);
  }
  return parseFloat(serviceFee) || 0;
};

// GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Total applications count
    const totalApplications = await Application.count();

    // Today's applications
    const todayApplications = await Application.count({
      where: { created_at: { [Op.gte]: today } }
    });

    // Pending payment count
    const pendingPayments = await Application.count({
      where: { payment_status: 'pending' }
    });

    // Completed payments count & revenue
    const completedPayments = await Application.findAll({
      where: { payment_status: 'completed' },
      include: [{ model: VisaConfiguration, as: 'visaConfiguration', attributes: ['service_fee'] }]
    });

    const totalRevenue = completedPayments.reduce((sum, app) => {
      return sum + calculateTotalFee(app.visaConfiguration?.service_fee);
    }, 0);

    // Today's revenue
    const todayRevenue = completedPayments
      .filter(app => new Date(app.created_at) >= today)
      .reduce((sum, app) => sum + calculateTotalFee(app.visaConfiguration?.service_fee), 0);

    // Recent applications (last 7 days)
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const recentApplications = await Application.count({
      where: { created_at: { [Op.gte]: last7Days } }
    });

    return res.status(200).json({
      totalApplications,
      todayApplications,
      pendingPayments,
      completedPaymentsCount: completedPayments.length,
      totalRevenue: totalRevenue.toFixed(2),
      todayRevenue: todayRevenue.toFixed(2),
      recentApplications
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/admin/applications
const getAllApplications = async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    
    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.payment_status = status;
    }
    
    const applications = await Application.findAll({
      where: whereClause,
      include: [
        {
          model: VisaConfiguration,
          as: 'visaConfiguration',
          attributes: ['citizenship', 'destination', 'service_fee']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Add application status based on payment_status
    const enrichedApplications = applications.map(app => ({
      ...app.toJSON(),
      status: app.payment_status === 'completed' ? 'Approved' : 
              app.payment_status === 'pending' ? 'Pending' : 'In Review',
      applicant_name: app.user_data?.fullName || app.user_data?.name || 'N/A',
      visa_type: `${app.visaConfiguration?.citizenship} to ${app.visaConfiguration?.destination}`
    }));

    const total = await Application.count({ where: whereClause });

    return res.status(200).json({ applications: enrichedApplications, total });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/admin/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByPk(id, {
      include: [
        {
          model: VisaConfiguration,
          as: 'visaConfiguration'
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const enrichedApplication = {
      ...application.toJSON(),
      status: application.payment_status === 'completed' ? 'Approved' : 
              application.payment_status === 'pending' ? 'Pending' : 'In Review',
      applicant_name: application.user_data?.fullName || application.user_data?.name || 'N/A',
      email: application.user_data?.email || 'N/A',
      phone: application.user_data?.phone || 'N/A'
    };

    return res.status(200).json(enrichedApplication);
  } catch (error) {
    console.error('Error fetching application:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/admin/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Map admin status to payment_status
    const statusMap = {
      'Approved': 'completed',
      'Pending': 'pending',
      'In Review': 'pending',
      'Rejected': 'failed'
    };

    if (statusMap[status]) {
      application.payment_status = statusMap[status];
    }
    
    if (notes) {
      application.user_data = { ...application.user_data, admin_notes: notes };
    }

    await application.save();

    return res.status(200).json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/admin/payments
const getAllPayments = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { payment_status: 'completed' },
      include: [
        {
          model: VisaConfiguration,
          as: 'visaConfiguration',
          attributes: ['citizenship', 'destination', 'service_fee']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const payments = applications.map(app => ({
      id: `PAY-${app.id.toString().padStart(4, '0')}`,
      application_id: app.id,
      customer: app.user_data?.fullName || app.user_data?.name || 'N/A',
      amount: `£${calculateTotalFee(app.visaConfiguration?.service_fee).toFixed(2)}`,
      status: 'Completed',
      method: app.user_data?.paymentMethod || 'Card',
      date: app.created_at,
      visa_type: `${app.visaConfiguration?.citizenship} to ${app.visaConfiguration?.destination}`
    }));

    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/admin/payments/stats
const getPaymentStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's revenue
    const todayCompleted = await Application.findAll({
      where: { 
        payment_status: 'completed',
        created_at: { [Op.gte]: today }
      },
      include: [{ model: VisaConfiguration, as: 'visaConfiguration', attributes: ['service_fee'] }]
    });
    const todayRevenue = todayCompleted.reduce((sum, app) => sum + calculateTotalFee(app.visaConfiguration?.service_fee), 0);

    // Yesterday's revenue for comparison
    const yesterdayCompleted = await Application.findAll({
      where: { 
        payment_status: 'completed',
        created_at: { [Op.gte]: yesterday, [Op.lt]: today }
      },
      include: [{ model: VisaConfiguration, as: 'visaConfiguration', attributes: ['service_fee'] }]
    });
    const yesterdayRevenue = yesterdayCompleted.reduce((sum, app) => sum + calculateTotalFee(app.visaConfiguration?.service_fee), 0);

    // Monthly revenue
    const monthlyCompleted = await Application.findAll({
      where: { 
        payment_status: 'completed',
        created_at: { [Op.gte]: startOfMonth }
      },
      include: [{ model: VisaConfiguration, as: 'visaConfiguration', attributes: ['service_fee'] }]
    });
    const monthlyRevenue = monthlyCompleted.reduce((sum, app) => sum + calculateTotalFee(app.visaConfiguration?.service_fee), 0);

    // Pending payments
    const pendingCount = await Application.count({ where: { payment_status: 'pending' } });
    const pendingAmount = await Application.findAll({
      where: { payment_status: 'pending' },
      include: [{ model: VisaConfiguration, as: 'visaConfiguration', attributes: ['service_fee'] }]
    });
    const pendingTotal = pendingAmount.reduce((sum, app) => sum + calculateTotalFee(app.visaConfiguration?.service_fee), 0);

    return res.status(200).json({
      todayRevenue: todayRevenue.toFixed(2),
      yesterdayRevenue: yesterdayRevenue.toFixed(2),
      monthlyRevenue: monthlyRevenue.toFixed(2),
      pendingCount,
      pendingTotal: pendingTotal.toFixed(2),
      totalTransactions: todayCompleted.length + yesterdayCompleted.length
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // Applications by destination
    const byDestination = await Application.findAll({
      include: [{ model: VisaConfiguration, as: 'visaConfiguration', attributes: ['destination'] }],
      where: { created_at: { [Op.gte]: last30Days } }
    });

    const destinationStats = {};
    byDestination.forEach(app => {
      const dest = app.visaConfiguration?.destination || 'Unknown';
      destinationStats[dest] = (destinationStats[dest] || 0) + 1;
    });

    const topDestinations = Object.entries(destinationStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Applications over time (last 7 days)
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const weeklyApps = await Application.findAll({
      where: { created_at: { [Op.gte]: last7Days } },
      order: [['created_at', 'ASC']]
    });

    const dailyStats = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyStats[d.toISOString().split('T')[0]] = 0;
    }
    
    weeklyApps.forEach(app => {
      const date = app.created_at.toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    // Conversion rate (completed vs total)
    const total = await Application.count({ where: { created_at: { [Op.gte]: last30Days } } });
    const completed = await Application.count({ 
      where: { 
        payment_status: 'completed',
        created_at: { [Op.gte]: last30Days }
      } 
    });

    return res.status(200).json({
      topDestinations,
      dailyTrends: Object.entries(dailyStats).map(([date, count]) => ({ date, count })),
      conversionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      totalApplications: total,
      completedApplications: completed
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/admin/configurations
const getAllConfigurations = async (req, res) => {
  try {
    const configurations = await VisaConfiguration.findAll({
      order: [['citizenship', 'ASC'], ['destination', 'ASC']]
    });
    return res.status(200).json(configurations);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/admin/configurations
const createConfiguration = async (req, res) => {
  try {
    const { citizenship, destination, service_fee, required_documents, form_schema } = req.body;

    const existing = await VisaConfiguration.findOne({
      where: { citizenship, destination }
    });

    if (existing) {
      return res.status(400).json({ message: 'Configuration for this route already exists' });
    }

    const config = await VisaConfiguration.create({
      citizenship,
      destination,
      service_fee,
      required_documents,
      form_schema
    });

    return res.status(201).json({ message: 'Configuration created successfully', configuration: config });
  } catch (error) {
    console.error('Error creating configuration:', error);
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

// DELETE /api/admin/configurations/:id
const deleteConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const configuration = await VisaConfiguration.findByPk(id);

    if (!configuration) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    await configuration.destroy();
    return res.status(200).json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getAllPayments,
  getPaymentStats,
  getAnalytics,
  getAllConfigurations,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration
};
