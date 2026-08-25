import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const PRESET_FLAGS = [
  { flag: '🇪🇺', label: 'Schengen / Europe', dest: 'Schengen (Europe)' },
  { flag: '🇬🇧', label: 'United Kingdom', dest: 'United Kingdom' },
  { flag: '🇦🇪', label: 'Dubai (UAE)', dest: 'Dubai (UAE)' },
  { flag: '🇺🇸', label: 'United States', dest: 'United States' },
  { flag: '🇨🇭', label: 'Switzerland', dest: 'Switzerland (Schengen)' },
  { flag: '🇨🇦', label: 'Canada', dest: 'Canada' },
  { flag: '🇸🇬', label: 'Singapore', dest: 'Singapore' },
  { flag: '🇯🇵', label: 'Japan', dest: 'Japan' },
  { flag: '🇦🇺', label: 'Australia', dest: 'Australia' },
  { flag: '🇫🇷', label: 'France', dest: 'France (Schengen)' },
  { flag: '🇩🇪', label: 'Germany', dest: 'Germany (Schengen)' },
  { flag: '🇳🇿', label: 'New Zealand', dest: 'New Zealand' },
  { flag: '🇸🇦', label: 'Saudi Arabia', dest: 'Saudi Arabia' },
  { flag: '🇹🇭', label: 'Thailand', dest: 'Thailand' },
  { flag: '🇲🇾', label: 'Malaysia', dest: 'Malaysia' },
  { flag: '🇹🇷', label: 'Turkey', dest: 'Turkey' }
];

const COLOR_PALETTES = [
  { id: 'indigo', label: 'Indigo', class: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-50 text-rose-700 border border-rose-200/60' },
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-50 text-amber-700 border border-amber-200/60' },
  { id: 'blue', label: 'Blue', class: 'bg-blue-50 text-blue-700 border border-blue-200/60' },
  { id: 'purple', label: 'Purple', class: 'bg-purple-50 text-purple-700 border border-purple-200/60' },
  { id: 'cyan', label: 'Cyan', class: 'bg-cyan-50 text-cyan-700 border border-cyan-200/60' },
  { id: 'orange', label: 'Orange', class: 'bg-orange-50 text-orange-700 border border-orange-200/60' },
  { id: 'teal', label: 'Teal', class: 'bg-teal-50 text-teal-700 border border-teal-200/60' },
  { id: 'sky', label: 'Sky', class: 'bg-sky-50 text-sky-700 border border-sky-200/60' }
];

const LiveApprovalsTab = ({ showNotification }) => {
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApproval, setEditingApproval] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    destination: '',
    flag: '🇪🇺',
    visa_type: 'Tourist Visa',
    time_ago: 'Just now',
    processing_time: 'Approved in 48h',
    avatar_text: '',
    avatar_bg: COLOR_PALETTES[0].class,
    is_active: true,
    sort_order: 0
  });

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllLiveApprovals();
      if (res.success) {
        setApprovals(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        } else {
          const active = (res.data || []).filter(a => a.is_active).length;
          setStats({ total: res.data.length, active, inactive: res.data.length - active });
        }
      }
    } catch (err) {
      console.error('Error fetching live approvals:', err);
      showNotification('Failed to fetch live approvals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleOpenAddModal = () => {
    setEditingApproval(null);
    setFormData({
      name: '',
      city: 'Hyderabad',
      destination: 'Schengen (Europe)',
      flag: '🇪🇺',
      visa_type: 'Tourist Visa',
      time_ago: 'Just now',
      processing_time: 'Approved in 48h',
      avatar_text: '',
      avatar_bg: COLOR_PALETTES[0].class,
      is_active: true,
      sort_order: approvals.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (approval) => {
    setEditingApproval(approval);
    setFormData({
      name: approval.name,
      city: approval.city || '',
      destination: approval.destination,
      flag: approval.flag || '✈️',
      visa_type: approval.visa_type || 'Tourist Visa',
      time_ago: approval.time_ago || 'Just now',
      processing_time: approval.processing_time || 'Fast-Track Approved',
      avatar_text: approval.avatar_text || '',
      avatar_bg: approval.avatar_bg || COLOR_PALETTES[0].class,
      is_active: approval.is_active,
      sort_order: approval.sort_order || 0
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    
    setFormData(prev => ({
      ...prev,
      name,
      avatar_text: initials || prev.avatar_text
    }));
  };

  const handleFlagSelect = (preset) => {
    setFormData(prev => ({
      ...prev,
      flag: preset.flag,
      destination: prev.destination === '' || prev.destination === 'Schengen (Europe)' ? preset.dest : prev.destination
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.destination.trim()) {
      showNotification('Name and Destination are required', 'error');
      return;
    }

    try {
      setActionLoading(true);
      if (editingApproval) {
        await adminAPI.updateLiveApproval(editingApproval.id, formData);
        showNotification('Live approval updated successfully!', 'success');
      } else {
        await adminAPI.createLiveApproval(formData);
        showNotification('New live approval added successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchApprovals();
    } catch (err) {
      console.error('Error saving approval:', err);
      showNotification(err.message || 'Failed to save approval', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminAPI.toggleLiveApproval(id);
      setApprovals(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_active: !item.is_active } : item
        )
      );
      showNotification('Status updated', 'success');
      // refresh stats
      const updated = approvals.map(item => item.id === id ? { ...item, is_active: !item.is_active } : item);
      const active = updated.filter(a => a.is_active).length;
      setStats({ total: updated.length, active, inactive: updated.length - active });
    } catch (err) {
      console.error('Error toggling status:', err);
      showNotification('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete approval for "${name}"?`)) return;

    try {
      await adminAPI.deleteLiveApproval(id);
      showNotification('Approval deleted successfully', 'success');
      fetchApprovals();
    } catch (err) {
      console.error('Error deleting approval:', err);
      showNotification('Failed to delete approval', 'error');
    }
  };

  const handleImportRealUsers = async () => {
    try {
      setActionLoading(true);
      const res = await adminAPI.importApprovalsFromApplications();
      if (res.success) {
        showNotification(res.message || 'Imported approvals from real applications!', 'success');
        fetchApprovals();
      }
    } catch (err) {
      console.error('Error importing:', err);
      showNotification('Failed to import applications', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all approvals to the curated default list? This will replace existing custom entries.')) return;

    try {
      setActionLoading(true);
      const res = await adminAPI.resetDefaultLiveApprovals();
      if (res.success) {
        showNotification('Approvals reset to curated defaults!', 'success');
        fetchApprovals();
      }
    } catch (err) {
      console.error('Error resetting defaults:', err);
      showNotification('Failed to reset defaults', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered approvals
  const filteredApprovals = approvals.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterStatus === 'active') return matchesSearch && item.is_active;
    if (filterStatus === 'inactive') return matchesSearch && !item.is_active;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Total Approvals</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary material-symbols-outlined text-sm">verified</span>
          </div>
          <p className="font-headline text-2xl font-bold mt-2 text-on-surface">{stats.total}</p>
          <p className="text-xs text-outline mt-1">In approval database</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Active On Website</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 material-symbols-outlined text-sm">visibility</span>
          </div>
          <p className="font-headline text-2xl font-bold mt-2 text-emerald-600">{stats.active}</p>
          <p className="text-xs text-emerald-600/80 mt-1">Live rotating on site</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Hidden / Inactive</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-500 material-symbols-outlined text-sm">visibility_off</span>
          </div>
          <p className="font-headline text-2xl font-bold mt-2 text-slate-700">{stats.inactive}</p>
          <p className="text-xs text-outline mt-1">Paused from rotation</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Website Live Feed</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
          <p className="font-headline text-xl font-bold mt-2 flex items-center gap-1.5">
            Active 24/7
          </p>
          <p className="text-xs text-emerald-100 mt-1">~9.5s rotation per visitor</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container-high shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-grow max-w-xl">
          <div className="relative w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">search</span>
            <input
              type="text"
              placeholder="Search by name, destination, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-sm focus:outline-none focus:border-primary transition-colors text-on-surface cursor-pointer"
          >
            <option value="all">All Approvals</option>
            <option value="active">Active Only</option>
            <option value="inactive">Hidden Only</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleImportRealUsers}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs sm:text-sm font-semibold transition-all border border-surface-container-highest cursor-pointer disabled:opacity-50"
            title="Import from real client applications submitted in database"
          >
            <span className="material-symbols-outlined text-sm text-primary">sync_saved_locally</span>
            Sync Real Users
          </button>

          <button
            onClick={handleResetDefaults}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-outline hover:text-on-surface rounded-xl text-xs sm:text-sm font-semibold transition-all border border-surface-container-highest cursor-pointer disabled:opacity-50"
            title="Reset to default curated list"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            Reset Defaults
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Approval
          </button>
        </div>
      </div>

      {/* Approvals Cards & Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-container-high flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-base text-on-surface">Live Visa Approvals Queue</h3>
            <p className="text-xs text-outline mt-0.5">
              These approved cards will automatically rotate on the bottom-left of the website for prospective travelers.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-surface-container-high rounded-full text-outline">
            {filteredApprovals.length} records
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-outline">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-primary">sync</span>
            <p className="text-sm">Loading live approvals...</p>
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="p-12 text-center text-outline space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-300">verified_user</span>
            <p className="text-sm font-medium">No live approvals found matching your search.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-primary/90 cursor-pointer"
            >
              + Create First Approval
            </button>
          </div>
        ) : (
          <div className="divide-y divide-surface-container-high">
            {filteredApprovals.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-surface-container-low/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Applicant Preview Card Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar + Flag */}
                  <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-xl ${item.avatar_bg || 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'} flex items-center justify-center font-bold text-sm shadow-xs font-headline`}>
                      {item.avatar_text || 'ZV'}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full px-0.5 shadow-xs border border-slate-100 leading-none">
                      {item.flag || '✈️'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-headline font-bold text-sm text-on-surface truncate">
                        {item.name}
                      </h4>
                      {item.city && (
                        <span className="text-xs text-outline">({item.city})</span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">· {item.time_ago || 'Just now'}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Approved for {item.destination}
                      </span>
                      <span className="text-outline text-[11px]">
                        {item.visa_type}
                      </span>
                      {item.processing_time && (
                        <span className="text-[10px] text-slate-500 bg-surface-container-high px-1.5 py-0.5 rounded">
                          ⚡ {item.processing_time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Toggle Switch & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {/* Active / Hidden Toggle */}
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      item.is_active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={item.is_active ? 'Click to pause/hide from website' : 'Click to show on website'}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                    {item.is_active ? 'Active on Site' : 'Hidden'}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 text-outline hover:text-primary hover:bg-surface-container-high rounded-xl transition-colors cursor-pointer"
                    title="Edit approval details"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-xl transition-colors cursor-pointer"
                    title="Delete approval"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Approval Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-dialog-appear">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-surface-container-high p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  {editingApproval ? 'Edit Live Visa Approval' : 'Add New Live Visa Approval'}
                </h3>
                <p className="text-xs text-outline mt-0.5">
                  Configure the applicant details displayed in the live trust toast on the website.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Live Preview Card */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Live Website Preview</p>
                <div className="bg-white/95 border border-slate-200/90 rounded-2xl shadow-sm p-3.5 flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className={`w-9 h-9 rounded-xl ${formData.avatar_bg} flex items-center justify-center font-bold text-xs tracking-tight shadow-xs font-headline`}>
                      {formData.avatar_text || 'ZV'}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-[11px] bg-white rounded-full px-0.5 shadow-xs border border-slate-100 leading-none">
                      {formData.flag || '✈️'}
                    </span>
                  </div>

                  <div className="flex-grow min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <h4 className="text-[13px] font-bold text-slate-900 truncate font-headline">
                        {formData.name || 'Applicant Name'}
                      </h4>
                      <span className="text-[11px] text-slate-400 truncate">({formData.city || 'Location'})</span>
                      <span className="text-[10px] text-slate-400 ml-auto shrink-0 font-medium">{formData.time_ago || 'Just now'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.2 rounded-md shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Approved
                      </span>
                      <span className="text-[11.5px] text-slate-600 truncate">
                        for <strong className="font-semibold text-slate-900">{formData.destination || 'Destination Country'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    Applicant Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Naseer Ahmed, Sneha Reddy"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    City / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad, Mumbai, Delhi NCR"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Destination & Preset Flags */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Destination Country / Zone <span className="text-error">*</span>
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schengen (Europe), United Kingdom, Dubai (UAE)"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="flex-grow px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    maxLength="4"
                    title="Country Flag Emoji"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-16 px-2 text-center text-xl bg-surface-container-low border border-surface-container-high rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Flag quick presets */}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-outline font-medium">Quick Destination & Flag Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FLAGS.map((preset) => (
                      <button
                        type="button"
                        key={preset.dest}
                        onClick={() => handleFlagSelect(preset)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          formData.flag === preset.flag
                            ? 'bg-primary/10 border-primary text-primary font-bold'
                            : 'bg-surface-container-low border-surface-container-high text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        <span>{preset.flag}</span>
                        <span className="text-[11px]">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visa Type & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Visa Category</label>
                  <input
                    type="text"
                    placeholder="Tourist Visa, Business"
                    value={formData.visa_type}
                    onChange={(e) => setFormData({ ...formData, visa_type: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Time Elapsed Text</label>
                  <input
                    type="text"
                    placeholder="12m ago, Just now, 2h ago"
                    value={formData.time_ago}
                    onChange={(e) => setFormData({ ...formData, time_ago: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Processing Badge</label>
                  <input
                    type="text"
                    placeholder="Approved in 48h, Instant e-Visa"
                    value={formData.processing_time}
                    onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Avatar Initials & Color Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Avatar Initials</label>
                  <input
                    type="text"
                    maxLength="3"
                    placeholder="NA"
                    value={formData.avatar_text}
                    onChange={(e) => setFormData({ ...formData, avatar_text: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-sm focus:outline-none focus:border-primary uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Avatar Style</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_PALETTES.map((col) => (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => setFormData({ ...formData, avatar_bg: col.class })}
                        className={`w-7 h-7 rounded-lg ${col.class} flex items-center justify-center font-bold text-[10px] cursor-pointer transition-transform ${
                          formData.avatar_bg === col.class ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'
                        }`}
                        title={col.label}
                      >
                        ✓
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-2xl border border-surface-container-high">
                <div>
                  <p className="font-bold text-xs text-on-surface">Display on Website Immediately</p>
                  <p className="text-[11px] text-outline">Enable to include this in the live rotating approval feed.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingApproval ? 'Update Approval' : 'Create Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveApprovalsTab;
