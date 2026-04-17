import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, authAPI } from '../services/api';

// Format currency helper
const formatCurrency = (amount) => {
  if (!amount) return '£0.00';
  return `£${parseFloat(amount).toFixed(2)}`;
};

// Calculate total fee from breakdown
const calculateTotalFee = (serviceFee) => {
  if (typeof serviceFee === 'object' && serviceFee !== null) {
    return (serviceFee.admin_fee || 0) + (serviceFee.service_fee || 0) + (serviceFee.express_fee || 0);
  }
  return parseFloat(serviceFee) || 0;
};

// Available document icons
const DOCUMENT_ICONS = [
  { value: 'travel', label: 'Travel/Passport' },
  { value: 'photo_camera', label: 'Photo' },
  { value: 'description', label: 'Document' },
  { value: 'home_work', label: 'Residency' },
  { value: 'flight', label: 'Flight' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'credit_card', label: 'Payment' },
  { value: 'health_and_safety', label: 'Insurance' },
  { value: 'work', label: 'Employment' },
  { value: 'account_balance', label: 'Bank/Finance' },
  { value: 'family_restroom', label: 'Family' },
  { value: 'school', label: 'Education' },
  { value: 'badge', label: 'ID/Badge' },
  { value: 'verified', label: 'Verified' },
  { value: 'receipt', label: 'Receipt' }
];

// Configurations Tab Component
const ConfigurationsTab = ({ showNotification }) => {
  const [configs, setConfigs] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({
    citizenship: '',
    destination: '',
    service_fee: { admin_fee: 0, service_fee: 0, express_fee: 0 },
    required_documents: []
  });
  const [newDoc, setNewDoc] = useState({ name: '', description: '', icon: 'description' });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const data = await adminAPI.getAllConfigurations();
      setConfigs(data);
    } catch (err) {
      showNotification('Failed to load configurations', 'error');
    }
  };

  const handleSaveConfig = async () => {
    try {
      if (editingConfig) {
        await adminAPI.updateConfiguration(editingConfig.id, configForm);
        showNotification('Configuration updated successfully');
      } else {
        await adminAPI.createConfiguration(configForm);
        showNotification('Configuration created successfully');
      }
      setShowConfigModal(false);
      setEditingConfig(null);
      loadConfigs();
    } catch (err) {
      showNotification(err.message || 'Failed to save configuration', 'error');
    }
  };

  const handleDeleteConfig = async (id) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      await adminAPI.deleteConfiguration(id);
      showNotification('Configuration deleted successfully');
      loadConfigs();
    } catch (err) {
      showNotification('Failed to delete configuration', 'error');
    }
  };

  const openEditModal = (config) => {
    setEditingConfig(config);
    // Normalize service_fee to object format
    let feeData = config.service_fee;
    if (typeof feeData === 'number' || typeof feeData === 'string') {
      const total = parseFloat(feeData) || 0;
      feeData = {
        admin_fee: parseFloat((total * 0.2).toFixed(2)),
        service_fee: parseFloat((total * 0.6).toFixed(2)),
        express_fee: parseFloat((total * 0.2).toFixed(2))
      };
    } else if (!feeData || typeof feeData !== 'object') {
      feeData = { admin_fee: 0, service_fee: 0, express_fee: 0 };
    }

    // Normalize required_documents to object format
    let docs = config.required_documents || [];
    if (Array.isArray(docs)) {
      docs = docs.map(doc => {
        if (typeof doc === 'string') {
          return { name: doc, description: '', icon: 'description' };
        }
        return doc;
      });
    } else {
      docs = [];
    }

    setConfigForm({
      citizenship: config.citizenship,
      destination: config.destination,
      service_fee: feeData,
      required_documents: docs
    });
    setShowConfigModal(true);
  };

  const openCreateModal = () => {
    setEditingConfig(null);
    setConfigForm({
      citizenship: '',
      destination: '',
      service_fee: { admin_fee: 0, service_fee: 0, express_fee: 0 },
      required_documents: []
    });
    setNewDoc({ name: '', description: '', icon: 'description' });
    setShowConfigModal(true);
  };

  const addDocument = () => {
    if (newDoc.name.trim()) {
      setConfigForm({
        ...configForm,
        required_documents: [...configForm.required_documents, { ...newDoc }]
      });
      setNewDoc({ name: '', description: '', icon: 'description' });
    }
  };

  const removeDocument = (idx) => {
    setConfigForm({
      ...configForm,
      required_documents: configForm.required_documents.filter((_, i) => i !== idx)
    });
  };

  const updateFeeBreakdown = (field, value) => {
    setConfigForm({
      ...configForm,
      service_fee: {
        ...configForm.service_fee,
        [field]: parseFloat(value) || 0
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-2xl font-bold">Visa Configurations ({configs.length})</h3>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Add Configuration
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-lg editorial-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="text-left p-4 font-semibold text-outline">Citizenship</th>
                <th className="text-left p-4 font-semibold text-outline">Destination</th>
                <th className="text-left p-4 font-semibold text-outline">Service Fee</th>
                <th className="text-left p-4 font-semibold text-outline">Documents</th>
                <th className="text-left p-4 font-semibold text-outline">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id} className="border-b border-surface-container-low hover:bg-surface-container-low/50">
                  <td className="p-4 font-semibold">{config.citizenship}</td>
                  <td className="p-4">{config.destination}</td>
                  <td className="p-4 font-bold">{formatCurrency(calculateTotalFee(config.service_fee))}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(config.required_documents || []).slice(0, 3).map((doc, i) => (
                        <span key={i} className="px-2 py-1 bg-surface-container-high rounded text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">{doc.icon || 'description'}</span>
                          {doc.name || doc}
                        </span>
                      ))}
                      {(config.required_documents || []).length > 3 && (
                        <span className="px-2 py-1 text-xs text-outline">+{(config.required_documents || []).length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => openEditModal(config)}
                      className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors mr-2"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteConfig(config.id)}
                      className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {configs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-outline">
                    No configurations found. Click "Add Configuration" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-lg editorial-shadow max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-surface-container-high flex items-center justify-between">
              <h3 className="font-headline text-xl font-bold">
                {editingConfig ? 'Edit Configuration' : 'New Configuration'}
              </h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Citizenship</label>
                  <input
                    type="text"
                    value={configForm.citizenship}
                    onChange={(e) => setConfigForm({...configForm, citizenship: e.target.value})}
                    className="w-full px-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g., United Kingdom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Destination</label>
                  <input
                    type="text"
                    value={configForm.destination}
                    onChange={(e) => setConfigForm({...configForm, destination: e.target.value})}
                    className="w-full px-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g., Europe (Schengen)"
                  />
                </div>
              </div>
              {/* Fee Breakdown */}
              <div>
                <label className="block text-sm font-semibold mb-2">Service Fee Breakdown</label>
                <div className="bg-surface-container-low rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-outline mb-1">Admin Fee (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={configForm.service_fee.admin_fee || 0}
                        onChange={(e) => updateFeeBreakdown('admin_fee', e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-high rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-outline mb-1">Service Fee (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={configForm.service_fee.service_fee || 0}
                        onChange={(e) => updateFeeBreakdown('service_fee', e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-high rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-outline mb-1">Express Fee (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={configForm.service_fee.express_fee || 0}
                        onChange={(e) => updateFeeBreakdown('express_fee', e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-high rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-outline-variant flex justify-between items-center">
                    <span className="text-sm text-outline">Total Service Fee:</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(calculateTotalFee(configForm.service_fee))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <label className="block text-sm font-semibold mb-2">Required Documents</label>

                {/* Add Document Form */}
                <div className="bg-surface-container-low rounded-lg p-4 space-y-3 mb-4">
                  <div>
                    <label className="block text-xs text-outline mb-1">Document Name</label>
                    <input
                      type="text"
                      value={newDoc.name}
                      onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                      className="w-full px-3 py-2 bg-surface-container-high rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-sm"
                      placeholder="e.g., Passport, Photo, Insurance..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-outline mb-1">Description</label>
                    <input
                      type="text"
                      value={newDoc.description}
                      onChange={(e) => setNewDoc({...newDoc, description: e.target.value})}
                      className="w-full px-3 py-2 bg-surface-container-high rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-sm"
                      placeholder="Brief description of the document..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-outline mb-1">Icon</label>
                      <select
                        value={newDoc.icon}
                        onChange={(e) => setNewDoc({...newDoc, icon: e.target.value})}
                        className="w-full px-3 py-2 bg-surface-container-high rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-sm"
                      >
                        {DOCUMENT_ICONS.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addDocument}
                        disabled={!newDoc.name.trim()}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Add Document
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document List */}
                <div className="space-y-2">
                  {configForm.required_documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                      <span className="material-symbols-outlined text-primary">
                        {doc.icon || 'description'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{doc.name}</div>
                        {doc.description && (
                          <div className="text-xs text-outline truncate">{doc.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => removeDocument(i)}
                        className="text-error hover:bg-error/10 p-1 rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                  {configForm.required_documents.length === 0 && (
                    <div className="text-center py-4 text-outline text-sm">
                      No documents added yet. Use the form above to add required documents.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-surface-container-high flex justify-end gap-3">
              <button 
                onClick={() => setShowConfigModal(false)}
                className="px-6 py-2 bg-surface-container-high rounded-lg hover:bg-surface-container-high/80"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveConfig}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:shadow-lg"
              >
                {editingConfig ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [applications, setApplications] = useState({ applications: [], total: 0 });
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [appFilter, setAppFilter] = useState('all');
  const [appSearch, setAppSearch] = useState('');
  const [appPage, setAppPage] = useState(0);
  const [notification, setNotification] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'applications', label: 'Applications', icon: 'description' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'configurations', label: 'Configurations', icon: 'tune' },
  ];

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Check authentication on mount - only runs once
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      console.log('[Auth] Checking authentication...');
      
      if (authAPI.isAuthenticated()) {
        console.log('[Auth] Credentials found, verifying...');
        try {
          const result = await authAPI.verifyCredentials();
          console.log('[Auth] Verify result:', result);
          
          if (isMounted) {
            if (result.valid) {
              setIsAuthenticated(true);
              setCurrentUser(authAPI.getCurrentUser());
            } else {
              console.log('[Auth] Credentials invalid, clearing...');
              localStorage.removeItem('adminUsername');
              localStorage.removeItem('adminPassword');
              localStorage.removeItem('adminUser');
            }
            setAuthChecking(false);
          }
        } catch (err) {
          console.log('[Auth] Verify error:', err);
          if (isMounted) {
            localStorage.removeItem('adminUsername');
            localStorage.removeItem('adminPassword');
            localStorage.removeItem('adminUser');
            setAuthChecking(false);
          }
        }
      } else {
        console.log('[Auth] No credentials found');
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    console.log('[Login] Attempting login...');

    try {
      const result = await authAPI.login(loginForm.username, loginForm.password);
      console.log('[Login] Result:', result);
      
      if (result.success) {
        setIsAuthenticated(true);
        setCurrentUser(result.user);
        showNotification('Login successful');
      } else {
        setLoginError(result.message || 'Login failed');
      }
    } catch (err) {
      console.log('[Login] Error:', err);
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    console.log('[Logout] Logging out...');
    // Clear stored credentials
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminPassword');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
  };

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const data = await adminAPI.getDashboardStats();
      setDashboardStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      const params = { status: appFilter, search: appSearch, limit: 20, offset: appPage * 20 };
      const data = await adminAPI.getAllApplications(params);
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    }
  }, [appFilter, appSearch, appPage]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      const [paymentsData, statsData] = await Promise.all([
        adminAPI.getAllPayments(),
        adminAPI.getPaymentStats()
      ]);
      setPayments(paymentsData);
      setPaymentStats(statsData);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await adminAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, []);

  // Load data on mount and menu change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      switch (activeMenu) {
        case 'dashboard':
          await fetchDashboardStats();
          await fetchApplications();
          await fetchPayments();
          break;
        case 'applications':
          await fetchApplications();
          break;
        case 'payments':
          await fetchPayments();
          break;
        case 'analytics':
          await fetchAnalytics();
          break;
        default:
          break;
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [activeMenu, fetchDashboardStats, fetchApplications, fetchPayments, fetchAnalytics]);

  // Handle view application details
  const handleViewApplication = async (id) => {
    try {
      const app = await adminAPI.getApplicationById(id);
      setSelectedApplication(app);
      setShowModal(true);
    } catch (err) {
      showNotification('Failed to load application details', 'error');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus, notes = '') => {
    try {
      await adminAPI.updateApplicationStatus(id, newStatus, notes);
      showNotification(`Application status updated to ${newStatus}`);
      setShowModal(false);
      setSelectedApplication(null);
      fetchApplications();
      fetchDashboardStats();
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  // Export data
  const handleExport = (type) => {
    let data, filename;
    
    switch (type) {
      case 'applications':
        data = applications.applications;
        filename = `applications_${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'payments':
        data = payments;
        filename = `payments_${new Date().toISOString().split('T')[0]}.json`;
        break;
      default:
        return;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${type} successfully`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderDashboard = () => {
    if (!dashboardStats) return null;

    const stats = [
      { label: 'Total Applications', value: dashboardStats.totalApplications.toLocaleString(), change: `+${dashboardStats.recentApplications}`, icon: 'description', color: 'primary' },
      { label: 'Pending Review', value: dashboardStats.pendingPayments.toString(), change: 'Awaiting payment', icon: 'pending', color: 'secondary' },
      { label: 'Completed Today', value: dashboardStats.completedPaymentsCount.toString(), change: 'Total completed', icon: 'check_circle', color: 'tertiary' },
      { label: 'Revenue', value: formatCurrency(dashboardStats.totalRevenue), change: `+${formatCurrency(dashboardStats.todayRevenue)} today`, icon: 'trending_up', color: 'primary' },
    ];

    return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-outline mb-1">{stat.label}</p>
                <p className="text-3xl font-headline font-bold text-on-surface">{stat.value}</p>
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-${stat.color}`}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
        <h3 className="font-headline text-xl font-bold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => navigate('/checklist')}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            New Application
          </button>
          <button 
            onClick={() => handleExport('applications')}
            className="flex items-center gap-2 bg-surface-container-high text-on-surface px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">download</span>
            Export Applications
          </button>
          <button 
            onClick={() => handleExport('payments')}
            className="flex items-center gap-2 bg-surface-container-high text-on-surface px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">payments</span>
            Export Payments
          </button>
          <button 
            onClick={() => setActiveMenu('applications')}
            className="flex items-center gap-2 bg-surface-container-high text-on-surface px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">visibility</span>
            View All Applications
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl font-bold">Recent Applications</h3>
            <button 
              onClick={() => setActiveMenu('applications')}
              className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="space-y-4">
            {applications.applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => handleViewApplication(app.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{app.applicant_name || 'N/A'}</p>
                    <p className="text-sm text-outline">{app.visa_type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
            {applications.applications.length === 0 && (
              <p className="text-center text-outline py-8">No applications found</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl font-bold">Recent Payments</h3>
            <button 
              onClick={() => setActiveMenu('payments')}
              className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="space-y-4">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-sm">payments</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{payment.customer}</p>
                    <p className="text-sm text-outline">{payment.visa_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-on-surface">{payment.amount}</p>
                  <span className="text-xs text-green-600">Completed</span>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-center text-outline py-8">No payments found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderApplications = () => {
    const filteredApps = applications.applications.filter(app => 
      appSearch === '' || 
      app.applicant_name?.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.visa_type?.toLowerCase().includes(appSearch.toLowerCase())
    );

    return (
    <div className="space-y-6">
      <div className="bg-surface-container-lowest rounded-lg editorial-shadow overflow-hidden">
        <div className="p-6 border-b border-surface-container-high">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-headline text-2xl font-bold">All Applications ({applications.total})</h3>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              </div>
              <select
                value={appFilter}
                onChange={(e) => { setAppFilter(e.target.value); setAppPage(0); }}
                className="px-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Approved</option>
                <option value="failed">Rejected</option>
              </select>
              <button 
                onClick={() => handleExport('applications')}
                className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="text-left p-4 font-semibold text-outline">ID</th>
                <th className="text-left p-4 font-semibold text-outline">Applicant</th>
                <th className="text-left p-4 font-semibold text-outline">Visa Type</th>
                <th className="text-left p-4 font-semibold text-outline">Fee</th>
                <th className="text-left p-4 font-semibold text-outline">Status</th>
                <th className="text-left p-4 font-semibold text-outline">Date</th>
                <th className="text-left p-4 font-semibold text-outline">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id} className="border-b border-surface-container-low hover:bg-surface-container-low/50">
                  <td className="p-4 font-mono text-sm text-outline">APP-{app.id.toString().padStart(4, '0')}</td>
                  <td className="p-4 font-semibold">{app.applicant_name || 'N/A'}</td>
                  <td className="p-4">{app.visa_type}</td>
                  <td className="p-4">{formatCurrency(app.visaConfiguration?.service_fee)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-outline">{formatDate(app.created_at)}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleViewApplication(app.id)}
                      className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-outline">
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {applications.total > 20 && (
          <div className="p-4 border-t border-surface-container-high flex items-center justify-between">
            <button 
              onClick={() => setAppPage(Math.max(0, appPage - 1))}
              disabled={appPage === 0}
              className="px-4 py-2 bg-surface-container-low rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-outline">Page {appPage + 1} of {Math.ceil(applications.total / 20)}</span>
            <button 
              onClick={() => setAppPage(appPage + 1)}
              disabled={(appPage + 1) * 20 >= applications.total}
              className="px-4 py-2 bg-surface-container-low rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
  };

  const renderPayments = () => {
    if (!paymentStats) return null;

    const changePercent = paymentStats.yesterdayRevenue > 0 
      ? (((paymentStats.todayRevenue - paymentStats.yesterdayRevenue) / paymentStats.yesterdayRevenue) * 100).toFixed(1)
      : 0;

    return (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <p className="text-sm text-outline mb-2">Today's Revenue</p>
          <p className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(paymentStats.todayRevenue)}</p>
          <p className={`text-sm mt-2 flex items-center gap-1 ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span className="material-symbols-outlined text-sm">{changePercent >= 0 ? 'trending_up' : 'trending_down'}</span>
            {Math.abs(changePercent)}% vs yesterday
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <p className="text-sm text-outline mb-2">Pending Revenue</p>
          <p className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(paymentStats.pendingTotal)}</p>
          <p className="text-sm text-yellow-600 mt-2">{paymentStats.pendingCount} payments pending</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <p className="text-sm text-outline mb-2">Monthly Revenue</p>
          <p className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(paymentStats.monthlyRevenue)}</p>
          <p className="text-sm text-green-600 mt-2">This month</p>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-surface-container-lowest rounded-lg editorial-shadow overflow-hidden">
        <div className="p-6 border-b border-surface-container-high flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold">Payment History ({payments.length})</h3>
          <button 
            onClick={() => handleExport('payments')}
            className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="text-left p-4 font-semibold text-outline">Payment ID</th>
                <th className="text-left p-4 font-semibold text-outline">Customer</th>
                <th className="text-left p-4 font-semibold text-outline">Visa Type</th>
                <th className="text-left p-4 font-semibold text-outline">Amount</th>
                <th className="text-left p-4 font-semibold text-outline">Method</th>
                <th className="text-left p-4 font-semibold text-outline">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-surface-container-low hover:bg-surface-container-low/50">
                  <td className="p-4 font-mono text-sm text-outline">{payment.id}</td>
                  <td className="p-4 font-semibold">{payment.customer}</td>
                  <td className="p-4 text-sm">{payment.visa_type}</td>
                  <td className="p-4 font-bold">{payment.amount}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        {payment.method === 'Card' ? 'credit_card' : payment.method === 'PayPal' ? 'account_balance_wallet' : 'account_balance'}
                      </span>
                      {payment.method}
                    </span>
                  </td>
                  <td className="p-4 text-outline">{formatDate(payment.date)}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-outline">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    const maxCount = Math.max(...analytics.topDestinations.map(d => d.count), 1);

    return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <p className="text-sm text-outline mb-2">Total Applications (30 days)</p>
          <p className="text-2xl font-headline font-bold text-on-surface">{analytics.totalApplications}</p>
          <p className="text-sm text-green-600 mt-2">{analytics.completedApplications} completed</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <p className="text-sm text-outline mb-2">Conversion Rate</p>
          <p className="text-2xl font-headline font-bold text-on-surface">{analytics.conversionRate}%</p>
          <p className="text-sm text-green-600 mt-2">Completed / Total</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <p className="text-sm text-outline mb-2">Avg. Daily Applications</p>
          <p className="text-2xl font-headline font-bold text-on-surface">{(analytics.totalApplications / 30).toFixed(1)}</p>
          <p className="text-sm text-green-600 mt-2">Last 30 days</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
          <p className="text-sm text-outline mb-2">Top Destination</p>
          <p className="text-2xl font-headline font-bold text-on-surface">{analytics.topDestinations[0]?.country || 'N/A'}</p>
          <p className="text-sm text-green-600 mt-2">{analytics.topDestinations[0]?.count || 0} applications</p>
        </div>
      </div>

      {/* Daily Trends */}
      <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
        <h3 className="font-headline text-xl font-bold mb-4">Daily Applications (Last 7 Days)</h3>
        <div className="flex items-end gap-2 h-48">
          {analytics.dailyTrends.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-primary rounded-t-lg transition-all hover:bg-secondary"
                style={{ 
                  height: `${Math.max(day.count * 20, 4)}px`,
                  minHeight: day.count > 0 ? '4px' : '2px'
                }}
                title={`${day.date}: ${day.count} applications`}
              ></div>
              <span className="text-xs text-outline rotate-0 whitespace-nowrap">
                {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Destinations */}
      <div className="bg-surface-container-lowest p-6 rounded-lg editorial-shadow">
        <h3 className="font-headline text-xl font-bold mb-4">Top Destinations (Last 30 Days)</h3>
        <div className="space-y-4">
          {analytics.topDestinations.map((dest, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-8 font-bold text-outline">{idx + 1}</span>
              <span className="flex-1 font-semibold w-32">{dest.country}</span>
              <div className="flex-1 max-w-md">
                <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all" 
                    style={{ width: `${(dest.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm text-outline w-16 text-right">{dest.count}</span>
            </div>
          ))}
          {analytics.topDestinations.length === 0 && (
            <p className="text-center text-outline py-8">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
  };

  // Render login screen
  const renderLoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl editorial-shadow p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Admin Login</h1>
          <p className="text-outline mt-2">Sign in to access the admin panel</p>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Username</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-primary/40"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-primary/40"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loginLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Signing in...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">login</span>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-container-high text-center">
          <p className="text-sm text-outline">
            Default credentials: <code className="bg-surface-container-low px-2 py-1 rounded">admin / admin123</code>
          </p>
        </div>
      </div>
    </div>
  );

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-3 text-outline">
          <span className="material-symbols-outlined animate-spin">sync</span>
          Checking authentication...
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return renderLoginScreen();
  }

  // Show admin panel if authenticated
  return (
    <div className="min-h-screen flex pt-20 bg-surface">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${
          notification.type === 'error' ? 'bg-error text-white' : 'bg-green-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">{notification.type === 'error' ? 'error' : 'check_circle'}</span>
            {notification.message}
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-lg editorial-shadow max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-surface-container-high flex items-center justify-between">
              <h3 className="font-headline text-xl font-bold">Application Details</h3>
              <button 
                onClick={() => { setShowModal(false); setSelectedApplication(null); }}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-sm text-outline mb-1">Applicant Name</p>
                  <p className="font-semibold">{selectedApplication.applicant_name}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-sm text-outline mb-1">Email</p>
                  <p className="font-semibold">{selectedApplication.email || 'N/A'}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-sm text-outline mb-1">Phone</p>
                  <p className="font-semibold">{selectedApplication.phone || 'N/A'}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-sm text-outline mb-1">Application Date</p>
                  <p className="font-semibold">{formatDate(selectedApplication.created_at)}</p>
                </div>
              </div>

              {/* Visa Info */}
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-sm text-outline mb-2">Visa Route</p>
                <p className="font-semibold text-lg">{selectedApplication.visa_type}</p>
                <p className="text-sm text-outline mt-2">Service Fee: {formatCurrency(selectedApplication.visaConfiguration?.service_fee)}</p>
              </div>

              {/* Status */}
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-sm text-outline mb-2">Current Status</p>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedApplication.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  selectedApplication.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedApplication.status}
                </span>
              </div>

              {/* Documents */}
              {selectedApplication.document_urls && selectedApplication.document_urls.length > 0 && (
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-sm text-outline mb-2">Uploaded Documents</p>
                  <div className="space-y-2">
                    {selectedApplication.document_urls.map((url, i) => (
                      <div key={i} className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined">description</span>
                        <a href={`http://localhost:5001${url}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Document {i + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2">Admin Notes</label>
                <textarea
                  className="w-full px-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-primary/40"
                  rows="3"
                  placeholder="Add notes about this application..."
                  defaultValue={selectedApplication.user_data?.admin_notes || ''}
                  id="adminNotes"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-surface-container-high">
                <button 
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'Approved', document.getElementById('adminNotes')?.value)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'In Review', document.getElementById('adminNotes')?.value)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Mark In Review
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'Rejected', document.getElementById('adminNotes')?.value)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-surface-container-high fixed left-0 top-20 bottom-0 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-white">admin_panel_settings</span>
            </div>
            <div>
              <p className="font-headline font-bold">Admin Panel</p>
              <p className="text-xs text-outline">Zoltan Travels</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === item.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-surface-container-high space-y-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-semibold">Logout</span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined">home</span>
              <span className="font-semibold">Back to Site</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline text-3xl font-bold text-on-surface capitalize">
                {activeMenu}
              </h1>
              <p className="text-outline mt-1">
                {activeMenu === 'dashboard' && 'Overview of your visa services'}
                {activeMenu === 'applications' && 'Manage visa applications'}
                {activeMenu === 'payments' && 'Track payments and revenue'}
                {activeMenu === 'analytics' && 'Insights and performance metrics'}
                {activeMenu === 'configurations' && 'Manage visa configurations'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-lowest rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                </div>
                <span className="font-semibold text-sm">{currentUser?.username || 'Admin'}</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-outline">
                <span className="material-symbols-outlined animate-spin">sync</span>
                Loading...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 bg-error/10 text-error rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && (
            <>
              {activeMenu === 'dashboard' && renderDashboard()}
              {activeMenu === 'applications' && renderApplications()}
              {activeMenu === 'payments' && renderPayments()}
              {activeMenu === 'analytics' && renderAnalytics()}
              {activeMenu === 'configurations' && <ConfigurationsTab showNotification={showNotification} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
