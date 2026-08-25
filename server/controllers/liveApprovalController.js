const { LiveApproval, Application, VisaConfiguration, sequelize } = require('../models');

// Curated starter approvals
const DEFAULT_APPROVALS = [
  {
    name: 'Naseer Ahmed',
    city: 'Hyderabad',
    destination: 'Schengen (Europe)',
    flag: '🇪🇺',
    visa_type: 'Tourist Visa (Multiple Entry)',
    time_ago: '12m ago',
    processing_time: 'Approved in 48h',
    avatar_text: 'NA',
    avatar_bg: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    is_active: true,
    sort_order: 1
  },
  {
    name: 'Rahul & Priya Jain',
    city: 'Delhi NCR',
    destination: 'United Kingdom',
    flag: '🇬🇧',
    visa_type: 'Standard Visitor',
    time_ago: '24m ago',
    processing_time: 'Approved in 3 days',
    avatar_text: 'RJ',
    avatar_bg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    is_active: true,
    sort_order: 2
  },
  {
    name: 'Sneha Reddy',
    city: 'Mumbai',
    destination: 'Dubai (UAE)',
    flag: '🇦🇪',
    visa_type: 'Express 30-Day',
    time_ago: '4m ago',
    processing_time: 'Approved in 6h',
    avatar_text: 'SR',
    avatar_bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    is_active: true,
    sort_order: 3
  },
  {
    name: 'Dr. Ananya Iyer',
    city: 'Bengaluru',
    destination: 'United States',
    flag: '🇺🇸',
    visa_type: 'B1/B2 Tourist & Biz',
    time_ago: '38m ago',
    processing_time: '10-Yr Multiple Entry',
    avatar_text: 'AI',
    avatar_bg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    is_active: true,
    sort_order: 4
  },
  {
    name: 'Mohammed Tariq',
    city: 'Dubai / Kochi',
    destination: 'Switzerland (Schengen)',
    flag: '🇨🇭',
    visa_type: 'Alpine Holiday',
    time_ago: '19m ago',
    processing_time: 'Approved in 48h',
    avatar_text: 'MT',
    avatar_bg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    is_active: true,
    sort_order: 5
  },
  {
    name: 'Vikram & Pooja Malhotra',
    city: 'Pune',
    destination: 'Canada',
    flag: '🇨🇦',
    visa_type: 'Visitor Visa (V-1)',
    time_ago: '45m ago',
    processing_time: 'Approved in 5 days',
    avatar_text: 'VM',
    avatar_bg: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    is_active: true,
    sort_order: 6
  },
  {
    name: 'Fatima Zahra',
    city: 'Kolkata',
    destination: 'Singapore',
    flag: '🇸🇬',
    visa_type: 'e-Visa Specialist',
    time_ago: '8m ago',
    processing_time: 'Approved in 24h',
    avatar_text: 'FZ',
    avatar_bg: 'bg-cyan-50 text-cyan-700 border border-cyan-200/60',
    is_active: true,
    sort_order: 7
  },
  {
    name: 'Rohan Mehta',
    city: 'Ahmedabad',
    destination: 'Japan',
    flag: '🇯🇵',
    visa_type: 'Single Entry Tourist',
    time_ago: '31m ago',
    processing_time: 'Approved in 4 days',
    avatar_text: 'RM',
    avatar_bg: 'bg-orange-50 text-orange-700 border border-orange-200/60',
    is_active: true,
    sort_order: 8
  },
  {
    name: 'Tanvi & Aakash Desai',
    city: 'Chennai',
    destination: 'Australia',
    flag: '🇦🇺',
    visa_type: 'Visitor Subclass 600',
    time_ago: '52m ago',
    processing_time: 'Approved in 72h',
    avatar_text: 'TD',
    avatar_bg: 'bg-teal-50 text-teal-700 border border-teal-200/60',
    is_active: true,
    sort_order: 9
  },
  {
    name: 'Farhan Akhtar',
    city: 'London / Hyderabad',
    destination: 'France (Schengen)',
    flag: '🇫🇷',
    visa_type: 'Short-Stay Schengen',
    time_ago: 'Just now',
    processing_time: 'Fast-Track Approved',
    avatar_text: 'FA',
    avatar_bg: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    is_active: true,
    sort_order: 10
  }
];

// Helper to ensure table exists and has seed data if empty
const ensureTableAndSeeds = async () => {
  try {
    await LiveApproval.sync({ alter: true });
    const count = await LiveApproval.count();
    if (count === 0) {
      await LiveApproval.bulkCreate(DEFAULT_APPROVALS);
      console.log('[LiveApproval] Auto-seeded default live approvals.');
    }
  } catch (error) {
    console.error('[LiveApproval] Error ensuring table:', error.message);
  }
};

// Public endpoint: Fetch active live visa approvals
const getPublicApprovals = async (req, res) => {
  try {
    await ensureTableAndSeeds();
    const approvals = await LiveApproval.findAll({
      where: { is_active: true },
      order: [
        ['sort_order', 'ASC'],
        ['updated_at', 'DESC']
      ],
      attributes: [
        'id', 'name', 'city', 'destination', 'flag',
        'visa_type', 'time_ago', 'processing_time',
        'avatar_text', 'avatar_bg', 'sort_order'
      ]
    });

    return res.status(200).json({
      success: true,
      data: approvals
    });
  } catch (error) {
    console.error('[LiveApproval] Error getting public approvals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch live approvals',
      error: error.message
    });
  }
};

// Admin endpoint: Fetch all approvals (active + inactive)
const getAllApprovals = async (req, res) => {
  try {
    await ensureTableAndSeeds();
    const approvals = await LiveApproval.findAll({
      order: [
        ['sort_order', 'ASC'],
        ['updated_at', 'DESC']
      ]
    });

    const activeCount = approvals.filter(a => a.is_active).length;

    return res.status(200).json({
      success: true,
      data: approvals,
      stats: {
        total: approvals.length,
        active: activeCount,
        inactive: approvals.length - activeCount
      }
    });
  } catch (error) {
    console.error('[LiveApproval] Error getting admin approvals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch live approvals',
      error: error.message
    });
  }
};

// Admin endpoint: Create new approval
const createApproval = async (req, res) => {
  try {
    await ensureTableAndSeeds();
    const {
      name,
      city,
      destination,
      flag,
      visa_type,
      time_ago,
      processing_time,
      avatar_text,
      avatar_bg,
      is_active,
      sort_order
    } = req.body;

    if (!name || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Name and Destination are required.'
      });
    }

    // Generate avatar text from name if not provided
    const initials = avatar_text || name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ZV';

    const approval = await LiveApproval.create({
      name: name.trim(),
      city: (city || 'India').trim(),
      destination: destination.trim(),
      flag: flag || '✈️',
      visa_type: (visa_type || 'Tourist Visa').trim(),
      time_ago: (time_ago || 'Just now').trim(),
      processing_time: (processing_time || 'Fast-Track Approved').trim(),
      avatar_text: initials,
      avatar_bg: avatar_bg || 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      sort_order: sort_order !== undefined ? parseInt(sort_order, 10) : 0
    });

    return res.status(201).json({
      success: true,
      message: 'Live visa approval created successfully.',
      data: approval
    });
  } catch (error) {
    console.error('[LiveApproval] Error creating approval:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create live approval',
      error: error.message
    });
  }
};

// Admin endpoint: Update approval
const updateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const approval = await LiveApproval.findByPk(id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Live approval record not found.'
      });
    }

    const {
      name,
      city,
      destination,
      flag,
      visa_type,
      time_ago,
      processing_time,
      avatar_text,
      avatar_bg,
      is_active,
      sort_order
    } = req.body;

    if (name !== undefined) approval.name = name.trim();
    if (city !== undefined) approval.city = city.trim();
    if (destination !== undefined) approval.destination = destination.trim();
    if (flag !== undefined) approval.flag = flag;
    if (visa_type !== undefined) approval.visa_type = visa_type.trim();
    if (time_ago !== undefined) approval.time_ago = time_ago.trim();
    if (processing_time !== undefined) approval.processing_time = processing_time.trim();
    if (avatar_text !== undefined) approval.avatar_text = avatar_text.trim();
    if (avatar_bg !== undefined) approval.avatar_bg = avatar_bg;
    if (is_active !== undefined) approval.is_active = Boolean(is_active);
    if (sort_order !== undefined) approval.sort_order = parseInt(sort_order, 10);

    await approval.save();

    return res.status(200).json({
      success: true,
      message: 'Live visa approval updated successfully.',
      data: approval
    });
  } catch (error) {
    console.error('[LiveApproval] Error updating approval:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update live approval',
      error: error.message
    });
  }
};

// Admin endpoint: Toggle active status
const toggleApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const approval = await LiveApproval.findByPk(id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Live approval record not found.'
      });
    }

    approval.is_active = !approval.is_active;
    await approval.save();

    return res.status(200).json({
      success: true,
      message: `Approval is now ${approval.is_active ? 'Active' : 'Hidden'}.`,
      data: approval
    });
  } catch (error) {
    console.error('[LiveApproval] Error toggling status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle status',
      error: error.message
    });
  }
};

// Admin endpoint: Delete approval
const deleteApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const approval = await LiveApproval.findByPk(id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Live approval record not found.'
      });
    }

    await approval.destroy();

    return res.status(200).json({
      success: true,
      message: 'Live approval deleted successfully.'
    });
  } catch (error) {
    console.error('[LiveApproval] Error deleting approval:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete approval',
      error: error.message
    });
  }
};

// Admin endpoint: Import from real applications in DB
const importFromApplications = async (req, res) => {
  try {
    await ensureTableAndSeeds();

    // Query recent applications with configuration details
    const applications = await Application.findAll({
      limit: 15,
      order: [['created_at', 'DESC']],
      include: [{ model: VisaConfiguration, as: 'visaConfiguration' }]
    });

    if (!applications || applications.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No user applications found in the system yet to import.',
        importedCount: 0
      });
    }

    const flagMap = {
      'schengen': '🇪🇺',
      'europe': '🇪🇺',
      'united kingdom': '🇬🇧',
      'uk': '🇬🇧',
      'dubai': '🇦🇪',
      'uae': '🇦🇪',
      'united states': '🇺🇸',
      'usa': '🇺🇸',
      'switzerland': '🇨🇭',
      'canada': '🇨🇦',
      'singapore': '🇸🇬',
      'japan': '🇯🇵',
      'australia': '🇦🇺',
      'france': '🇫🇷',
      'germany': '🇩🇪',
      'new zealand': '🇳🇿'
    };

    const colorPalettes = [
      'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
      'bg-rose-50 text-rose-700 border border-rose-200/60',
      'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      'bg-amber-50 text-amber-700 border border-amber-200/60',
      'bg-blue-50 text-blue-700 border border-blue-200/60',
      'bg-purple-50 text-purple-700 border border-purple-200/60',
      'bg-cyan-50 text-cyan-700 border border-cyan-200/60',
      'bg-teal-50 text-teal-700 border border-teal-200/60'
    ];

    let importedCount = 0;

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const userData = app.user_data || {};
      const fullName = userData.fullName || userData.name || userData.applicant_name;
      
      if (!fullName) continue;

      const destination = app.visaConfiguration?.destination || userData.destination || 'Schengen (Europe)';
      const city = userData.city || userData.location || 'India';
      
      // Look for flag
      const destLower = destination.toLowerCase();
      let flag = '✈️';
      for (const [key, f] of Object.entries(flagMap)) {
        if (destLower.includes(key)) {
          flag = f;
          break;
        }
      }

      const initials = fullName
        .split(' ')
        .filter(Boolean)
        .map(p => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'ZV';

      const avatarBg = colorPalettes[i % colorPalettes.length];

      // Format time elapsed
      const diffMinutes = Math.floor((Date.now() - new Date(app.created_at).getTime()) / (1000 * 60));
      let timeAgo = 'Just now';
      if (diffMinutes < 60) {
        timeAgo = `${Math.max(2, diffMinutes)}m ago`;
      } else if (diffMinutes < 1440) {
        timeAgo = `${Math.floor(diffMinutes / 60)}h ago`;
      } else {
        timeAgo = `${Math.floor(diffMinutes / 1440)}d ago`;
      }

      await LiveApproval.create({
        name: fullName,
        city: city,
        destination: destination,
        flag: flag,
        visa_type: userData.visaType || 'Tourist / Visitor Visa',
        time_ago: timeAgo,
        processing_time: 'Fast-Track Approved',
        avatar_text: initials,
        avatar_bg: avatarBg,
        is_active: true,
        sort_order: i + 1
      });

      importedCount++;
    }

    const allApprovals = await LiveApproval.findAll({
      order: [['sort_order', 'ASC'], ['updated_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${importedCount} real user approvals!`,
      importedCount,
      data: allApprovals
    });
  } catch (error) {
    console.error('[LiveApproval] Error importing from applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to import from applications',
      error: error.message
    });
  }
};

// Admin endpoint: Reset to curated defaults
const resetDefaultApprovals = async (req, res) => {
  try {
    await ensureTableAndSeeds();
    await LiveApproval.destroy({ where: {} });
    await LiveApproval.bulkCreate(DEFAULT_APPROVALS);

    const approvals = await LiveApproval.findAll({
      order: [['sort_order', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Live approvals successfully reset to default curated list.',
      data: approvals
    });
  } catch (error) {
    console.error('[LiveApproval] Error resetting defaults:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset default approvals',
      error: error.message
    });
  }
};

module.exports = {
  getPublicApprovals,
  getAllApprovals,
  createApproval,
  updateApproval,
  toggleApprovalStatus,
  deleteApproval,
  importFromApplications,
  resetDefaultApprovals
};
