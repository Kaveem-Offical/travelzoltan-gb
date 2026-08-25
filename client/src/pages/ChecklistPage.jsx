import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { visaAPI } from '../services/api';
import { hasPayInFullOption, getPayNowPoints, getPayInFullPoints, resolvePointText } from '../utils/paymentUtils';

const countryCodes = [
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+966', country: 'SA', flag: '🇸🇦' },
  { code: '+974', country: 'QA', flag: '🇶🇦' }
];

const ChecklistPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visaData, setVisaData] = useState(null);
  
  const citizenship = searchParams.get('citizenship') || location.state?.citizenship || 'United Kingdom';
  const destination = searchParams.get('destination') || location.state?.destination || 'Europe (Schengen States)';
  const initialCategory = searchParams.get('category') || location.state?.selectedCategory || 'employed';
  const initialVisaCategory = searchParams.get('visaType') || location.state?.selectedVisaCategory || 'tourist';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedVisaCategory, setSelectedVisaCategory] = useState(initialVisaCategory);
  const [activeTab, setActiveTab] = useState('now');

  // Query Form 2-Step State
  const [queryStep, setQueryStep] = useState(1); // 1 = Personal Info, 2 = Query Details, 3 = Success Confirmation
  const [queryPersonalInfo, setQueryPersonalInfo] = useState({
    name: '',
    surname: '',
    email: '',
    phoneCountryCode: '+44',
    phoneLocal: '',
    preferredContact: 'WhatsApp'
  });
  const [queryDetails, setQueryDetails] = useState({
    queryType: 'Group Member Application',
    message: '',
    dynamicAnswers: {}
  });
  const [queryFormError, setQueryFormError] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [submittedQueryData, setSubmittedQueryData] = useState(null);

  // Sync parameters with URL search params so the URL is always shareable
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    let changed = false;

    if (currentParams.get('citizenship') !== citizenship) {
      currentParams.set('citizenship', citizenship);
      changed = true;
    }
    if (currentParams.get('destination') !== destination) {
      currentParams.set('destination', destination);
      changed = true;
    }
    if (selectedCategory && currentParams.get('category') !== selectedCategory) {
      currentParams.set('category', selectedCategory);
      changed = true;
    }
    if (selectedVisaCategory && currentParams.get('visaType') !== selectedVisaCategory) {
      currentParams.set('visaType', selectedVisaCategory);
      changed = true;
    }

    if (changed) {
      setSearchParams(currentParams, { replace: true });
    }
  }, [citizenship, destination, selectedCategory, selectedVisaCategory, location.search, setSearchParams]);

  useEffect(() => {
    fetchVisaRequirements();
  }, [citizenship, destination]);

  useEffect(() => {
    setActiveTab('now');
  }, [selectedCategory, selectedVisaCategory]);

  const fetchVisaRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await visaAPI.getVisaRequirements(citizenship, destination);
      setVisaData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch visa requirements');
      console.error('Error fetching visa requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartApplication = () => {
    const params = new URLSearchParams({
      citizenship,
      destination,
      category: selectedCategory,
      visaType: selectedVisaCategory
    });
    navigate(`/apply?${params.toString()}`, { 
      state: { 
        citizenship, 
        destination, 
        visaData,
        selectedCategory,
        selectedVisaCategory
      } 
    });
  };

  const fallbackDocsNow = [
    { name: 'Passport Front and Back', description: 'Valid for at least 6 months beyond intended stay.', icon: 'travel' },
    { name: 'UK Valid Status (Online Status)', description: 'Proof of current legal status or residency requirement.', icon: 'badge' }
  ];

  let docsRequiredNow = fallbackDocsNow;
  let docsRequiredLater = [];
  let queryFormDocs = [];

  if (visaData?.required_documents) {
    const visaCatDocs = visaData.required_documents[selectedVisaCategory] || {};
    const applicantCatDocs = visaCatDocs[selectedCategory] || {};
    
    const hasAnyConfigured = Object.keys(visaData.required_documents).length > 0;
    
    if (applicantCatDocs.now && applicantCatDocs.now.length > 0) {
      docsRequiredNow = applicantCatDocs.now;
    } else if (hasAnyConfigured) {
      docsRequiredNow = applicantCatDocs.now || [];
    }

    if (applicantCatDocs.later && applicantCatDocs.later.length > 0) {
      docsRequiredLater = applicantCatDocs.later;
    }
    if (applicantCatDocs.query && applicantCatDocs.query.length > 0) {
      queryFormDocs = applicantCatDocs.query;
    }
  }

  // Dynamic pricing
  const serviceFee = visaData?.service_fee;

  const totalAmount = (() => {
    if (!serviceFee) return 0;
    if (typeof serviceFee === 'object' && serviceFee !== null) {
      return serviceFee.total_amount
        || ((serviceFee.admin_fee || 0) + (serviceFee.service_fee || 0) + (serviceFee.express_fee || 0));
    }
    return parseFloat(serviceFee) || 0;
  })();

  const payNowAmount = (() => {
    if (!serviceFee || typeof serviceFee !== 'object') return totalAmount;
    return serviceFee.pay_now_amount !== undefined && serviceFee.pay_now_amount !== null
      ? (parseFloat(serviceFee.pay_now_amount) || totalAmount)
      : totalAmount;
  })();

  const payInFullAmount = (() => {
    if (!serviceFee || typeof serviceFee !== 'object') return 0;
    return parseFloat(serviceFee.pay_in_full_amount) || 0;
  })();

  const hasPayInFull = hasPayInFullOption(serviceFee);
  const discountAmount = hasPayInFull ? Math.max(0, totalAmount - payInFullAmount) : 0;
  const discountPercentage = (hasPayInFull && totalAmount > 0) ? Math.round((discountAmount / totalAmount) * 100) : 0;

  const payNowPoints = getPayNowPoints(serviceFee);
  const payInFullPoints = getPayInFullPoints(serviceFee);

  const getDocsCountForVisaCategory = (vkKey) => {
    if (!visaData?.required_documents) return -1;
    const vkDocs = visaData.required_documents[vkKey];
    if (!vkDocs || typeof vkDocs !== 'object') return 0;

    let total = 0;
    Object.values(vkDocs).forEach(acDocs => {
      if (acDocs && typeof acDocs === 'object') {
        total += (Array.isArray(acDocs.now) ? acDocs.now.length : 0);
        total += (Array.isArray(acDocs.later) ? acDocs.later.length : 0);
        total += (Array.isArray(acDocs.query) ? acDocs.query.length : 0);
      }
    });
    return total;
  };

  const getDocsCountForApplicantCategory = (acKey, vkKey) => {
    if (!visaData?.required_documents) return -1;
    const acDocs = visaData.required_documents[vkKey]?.[acKey];
    if (!acDocs || typeof acDocs !== 'object') return 0;

    let total = 0;
    total += (Array.isArray(acDocs.now) ? acDocs.now.length : 0);
    total += (Array.isArray(acDocs.later) ? acDocs.later.length : 0);
    total += (Array.isArray(acDocs.query) ? acDocs.query.length : 0);
    return total;
  };

  const allCategories = [
    { key: 'student', label: 'Student', icon: 'school' },
    { key: 'employed', label: 'Employed', icon: 'work' },
    { key: 'self_employed', label: 'Self-Employed', icon: 'handshake' },
    { key: 'unemployed', label: 'Unemployed', icon: 'person_off' },
    { key: 'other', label: 'Other / Query', icon: 'more_horiz' }
  ];

  const allVisaCategories = [
    { key: 'tourist', label: 'Tourist', icon: 'flight_takeoff' },
    { key: 'visiting', label: 'Visit (Family/Friend)', icon: 'family_restroom' },
    { key: 'business', label: 'Business Visa', icon: 'business_center' }
  ];

  const availableVisaCategories = allVisaCategories.filter(vc => {
    const count = getDocsCountForVisaCategory(vc.key);
    return count === -1 || count > 0;
  });

  const activeVisaCategoriesList = availableVisaCategories.length > 0 ? availableVisaCategories : allVisaCategories;

  useEffect(() => {
    if (activeVisaCategoriesList.length > 0 && !activeVisaCategoriesList.some(vc => vc.key === selectedVisaCategory)) {
      setSelectedVisaCategory(activeVisaCategoriesList[0].key);
    }
  }, [activeVisaCategoriesList, selectedVisaCategory]);

  const availableCategories = allCategories.filter(cat => {
    if (cat.key === 'other') return true;
    const count = getDocsCountForApplicantCategory(cat.key, selectedVisaCategory);
    return count === -1 || count > 0;
  });

  const activeCategoriesList = availableCategories.length > 0 ? availableCategories : allCategories;

  useEffect(() => {
    if (activeCategoriesList.length > 0 && !activeCategoriesList.some(cat => cat.key === selectedCategory)) {
      setSelectedCategory(activeCategoriesList[0].key);
    }
  }, [activeCategoriesList, selectedCategory, selectedVisaCategory]);

  const getCategoryGridClass = () => {
    const len = activeCategoriesList.length;
    if (len === 1) return 'grid grid-cols-1 gap-4';
    if (len === 2) return 'grid grid-cols-2 gap-4';
    if (len === 3) {
      return activeCategoriesList.some(c => c.key === 'other') 
        ? 'grid grid-cols-2 gap-4' 
        : 'grid grid-cols-1 sm:grid-cols-3 gap-4';
    }
    return 'grid grid-cols-2 gap-4';
  };

  const getCategoryItemClass = (catKey) => {
    const len = activeCategoriesList.length;
    if (catKey === 'other' && len % 2 !== 0 && len > 1) {
      return 'col-span-2';
    }
    return 'col-span-1';
  };

  // Handle Step 1 validation
  const handleProceedToQueryDetails = (e) => {
    e.preventDefault();
    setQueryFormError('');

    if (!queryPersonalInfo.name.trim()) {
      setQueryFormError('Please enter your first name.');
      return;
    }

    if (!queryPersonalInfo.email.trim() && !queryPersonalInfo.phoneLocal.trim()) {
      setQueryFormError('Please provide at least your Email address or Phone number.');
      return;
    }

    if (queryPersonalInfo.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(queryPersonalInfo.email.trim())) {
      setQueryFormError('Please enter a valid email address.');
      return;
    }

    setQueryStep(2);
  };

  // Handle final query submission
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setQueryFormError('');
    setIsSubmittingQuery(true);

    try {
      const fullPhone = queryPersonalInfo.phoneLocal.trim() 
        ? `${queryPersonalInfo.phoneCountryCode} ${queryPersonalInfo.phoneLocal.trim()}`
        : '';

      const isSpecialCategory = selectedCategory === 'other';
      const qType = isSpecialCategory ? queryDetails.queryType : `Query Form (${selectedCategory})`;

      const payload = {
        configuration_id: visaData?.configuration_id,
        citizenship,
        destination,
        name: queryPersonalInfo.name.trim(),
        surname: queryPersonalInfo.surname.trim(),
        fullName: `${queryPersonalInfo.name.trim()} ${queryPersonalInfo.surname.trim()}`.trim(),
        email: queryPersonalInfo.email.trim(),
        phone: fullPhone,
        phoneLocal: queryPersonalInfo.phoneLocal.trim(),
        phoneCountryCode: queryPersonalInfo.phoneCountryCode,
        preferredContact: queryPersonalInfo.preferredContact,
        applicantCategory: selectedCategory,
        applicantStatus: selectedCategory,
        visaCategory: selectedVisaCategory,
        queryType: qType,
        message: queryDetails.message.trim(),
        queryAnswers: queryDetails.dynamicAnswers,
        source: 'Query Form'
      };

      const response = await visaAPI.submitQuery(payload);

      setSubmittedQueryData({
        ...payload,
        queryId: response.queryId || response.applicationId
      });
      setQueryStep(3); // Move to Success State
    } catch (err) {
      console.error('Error submitting query:', err);
      setQueryFormError(err.message || 'Failed to submit your query. Please try again or call us.');
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  const handleResetQueryForm = () => {
    setQueryStep(1);
    setQueryPersonalInfo({
      name: '',
      surname: '',
      email: '',
      phoneCountryCode: '+44',
      phoneLocal: '',
      preferredContact: 'WhatsApp'
    });
    setQueryDetails({
      queryType: 'Group Member Application',
      message: '',
      dynamicAnswers: {}
    });
    setSubmittedQueryData(null);
    setQueryFormError('');
  };

  // Render the interactive 2-step Query Form component
  const renderQueryFlow = (isSpecialCategory) => {
    if (queryStep === 3 && submittedQueryData) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-sm animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 shadow-inner">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 mb-2">
            Query Received • Ref #QRY-{submittedQueryData.queryId?.toString().padStart(4, '0')}
          </span>
          <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-2">
            Thank You, {submittedQueryData.name}!
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mb-6 leading-relaxed">
            Your query has been securely registered in our system. A dedicated visa consultant will review your request and reach out to you via <strong className="text-on-surface">{submittedQueryData.preferredContact}</strong> {submittedQueryData.email ? `(${submittedQueryData.email})` : `(${submittedQueryData.phone})`} within 24 business hours.
          </p>

          <div className="w-full max-w-md bg-white rounded-xl p-4 border border-outline-variant/30 text-left mb-6 text-xs space-y-2">
            <div className="flex justify-between pb-2 border-b border-outline-variant/20">
              <span className="text-outline">Route:</span>
              <span className="font-bold text-on-surface">{citizenship} → {destination}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-outline-variant/20">
              <span className="text-outline">Visa Category:</span>
              <span className="font-semibold text-on-surface capitalize">{selectedVisaCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Query Type:</span>
              <span className="font-semibold text-primary">{submittedQueryData.queryType}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleResetQueryForm}
              className="px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold hover:bg-surface-container-low transition-colors"
            >
              Submit Another Query
            </button>
            <button
              onClick={handleStartApplication}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
            >
              Start Full Application
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {/* Header and Step Indicator */}
        <div className="flex items-start justify-between border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">
                {queryStep === 1 ? 'contact_phone' : 'help_center'}
              </span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                {isSpecialCategory ? 'Special Category Query' : 'Custom Visa Query'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {queryStep === 1 ? 'Step 1: Your Contact Information' : 'Step 2: Your Query Details & Questions'}
              </p>
            </div>
          </div>
          
          {/* Step Progress Pill */}
          <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full text-xs font-bold text-on-surface">
            <span className={`w-2 h-2 rounded-full ${queryStep === 1 ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></span>
            Step {queryStep} of 2
          </div>
        </div>

        {queryFormError && (
          <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-red-600">error</span>
            {queryFormError}
          </div>
        )}

        {/* STEP 1: Personal Contact Info First */}
        {queryStep === 1 ? (
          <form onSubmit={handleProceedToQueryDetails} className="flex flex-col gap-5">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/15 text-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">info</span>
              <span>Please provide your contact information first so our visa specialist team can reach out and assist you directly.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={queryPersonalInfo.name}
                  onChange={(e) => setQueryPersonalInfo({ ...queryPersonalInfo, name: e.target.value })}
                  placeholder="e.g. David"
                  className="w-full p-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-lowest text-sm font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={queryPersonalInfo.surname}
                  onChange={(e) => setQueryPersonalInfo({ ...queryPersonalInfo, surname: e.target.value })}
                  placeholder="e.g. Smith"
                  className="w-full p-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-lowest text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={queryPersonalInfo.email}
                  onChange={(e) => setQueryPersonalInfo({ ...queryPersonalInfo, email: e.target.value })}
                  placeholder="e.g. david.smith@example.com"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-lowest text-sm font-medium transition-all"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Phone Number (WhatsApp Preferred) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-12 gap-2">
                <select
                  value={queryPersonalInfo.phoneCountryCode}
                  onChange={(e) => setQueryPersonalInfo({ ...queryPersonalInfo, phoneCountryCode: e.target.value })}
                  className="col-span-4 p-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-lowest text-xs font-bold"
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code} ({c.country})</option>
                  ))}
                </select>
                <div className="col-span-8 relative">
                  <input
                    type="tel"
                    value={queryPersonalInfo.phoneLocal}
                    onChange={(e) => setQueryPersonalInfo({ ...queryPersonalInfo, phoneLocal: e.target.value })}
                    placeholder="7123456789"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-lowest text-sm font-medium transition-all"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">phone</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Preferred Contact Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'WhatsApp', label: 'WhatsApp', icon: 'chat' },
                  { id: 'Phone Call', label: 'Phone Call', icon: 'call' },
                  { id: 'Email', label: 'Email', icon: 'mail' }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setQueryPersonalInfo({ ...queryPersonalInfo, preferredContact: opt.id })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      queryPersonalInfo.preferredContact === opt.id
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              Continue to Query Details
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>
        ) : (
          /* STEP 2: Query Details & Questions */
          <form onSubmit={handleQuerySubmit} className="flex flex-col gap-5">
            {/* User Details Summary Pill */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">person</span>
                <span className="font-bold text-on-surface">
                  {queryPersonalInfo.name} {queryPersonalInfo.surname}
                </span>
                <span className="text-outline">
                  • {queryPersonalInfo.email || `${queryPersonalInfo.phoneCountryCode} ${queryPersonalInfo.phoneLocal}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQueryStep(1)}
                className="text-primary font-bold hover:underline"
              >
                Edit Details
              </button>
            </div>

            {isSpecialCategory ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                    Query Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={queryDetails.queryType}
                    onChange={(e) => setQueryDetails({ ...queryDetails, queryType: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-lowest text-sm font-medium"
                  >
                    <option value="Group Member Application">Group Member Application</option>
                    <option value="Application for a Minor">Application for a Minor / Child</option>
                    <option value="Urgent / Rush Appointment">Urgent / Rush Appointment Request</option>
                    <option value="Long Stay / Work / Study Visa">Long Stay / Work / Study Visa</option>
                    <option value="Previous Rejection Consultation">Previous Rejection / Appeal Case</option>
                    <option value="Other Special Category">Other Special Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                    Message / Explain Your Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="5"
                    required
                    value={queryDetails.message}
                    onChange={(e) => setQueryDetails({ ...queryDetails, message: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-lowest text-sm font-medium leading-relaxed"
                    placeholder="Please provide details about your situation (e.g. intended travel dates, group size, special requirements or questions)..."
                  ></textarea>
                </div>
              </>
            ) : (
              <>
                {/* Dynamic Admin-Configured Query Questions */}
                {queryFormDocs.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                    <label className="block text-sm font-bold text-on-surface mb-1">{q.name}</label>
                    {q.description && <p className="text-xs text-on-surface-variant mb-3">{q.description}</p>}
                    
                    {q.type === 'textarea' ? (
                      <textarea
                        rows="3"
                        value={queryDetails.dynamicAnswers[q.name] || ''}
                        onChange={(e) => setQueryDetails({
                          ...queryDetails,
                          dynamicAnswers: { ...queryDetails.dynamicAnswers, [q.name]: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-lowest text-sm"
                        placeholder="Your answer..."
                      ></textarea>
                    ) : q.type === 'checkbox' ? (
                      <label className="flex items-center gap-3 p-3 bg-surface-lowest rounded-xl border border-outline-variant/30 cursor-pointer hover:border-primary/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={!!queryDetails.dynamicAnswers[q.name]}
                          onChange={(e) => setQueryDetails({
                            ...queryDetails,
                            dynamicAnswers: { ...queryDetails.dynamicAnswers, [q.name]: e.target.checked }
                          })}
                          className="w-5 h-5 accent-primary"
                        />
                        <span className="text-sm font-semibold">Yes, I confirm</span>
                      </label>
                    ) : (
                      <input
                        type={q.type || 'text'}
                        value={queryDetails.dynamicAnswers[q.name] || ''}
                        onChange={(e) => setQueryDetails({
                          ...queryDetails,
                          dynamicAnswers: { ...queryDetails.dynamicAnswers, [q.name]: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-lowest text-sm"
                        placeholder={q.type === 'date' ? '' : 'Your answer...'}
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                    Additional Notes / Message (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={queryDetails.message}
                    onChange={(e) => setQueryDetails({ ...queryDetails, message: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-lowest text-sm"
                    placeholder="Any extra details you'd like our consultant to know..."
                  ></textarea>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setQueryStep(1)}
                disabled={isSubmittingQuery}
                className="w-1/3 py-3.5 rounded-xl border border-outline-variant font-bold text-sm text-on-surface hover:bg-surface-container-high transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmittingQuery}
                className="w-2/3 bg-primary text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingQuery ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Submitting Query...
                  </>
                ) : (
                  <>
                    Submit Query
                    <span className="material-symbols-outlined text-sm">send</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-24 bg-surface-lowest">
      {/* Hero Header */}
      <header className="relative mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-primary/10 text-primary border border-primary/20 rounded-full">
              Your Trusted Digital Visa Consultant
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 leading-[1.1]">
              Document Checklist for <span className="text-primary">{citizenship}</span>
            </h1>
            <p className="text-xl text-on-surface-variant font-light max-w-lg leading-relaxed">
              Traveling to {destination}. Our premium concierge service ensures your visa application is seamless, fast, and 100% compliant.
            </p>
          </div>
          <div className="relative">
            <div className="asymmetric-image w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20">
              <img 
                alt="Scenic European street" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80" 
              />
            </div>
          </div>
        </div>
      </header>

      {loading && !visaData ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-on-surface-variant font-medium">Loading visa requirements...</p>
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-8 rounded-2xl mb-12 border border-red-200">
          <h3 className="font-bold mb-2">Error Loading Requirements</h3>
          <p>{error}</p>
          <button 
            onClick={fetchVisaRequirements}
            className="mt-4 bg-error text-on-error px-6 py-2 rounded-xl hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* Section 1: Pricing Breakdown */}
          <section className="flex flex-col gap-6 mb-12">
            <div className="text-center mb-8">
              <h2 className="font-headline text-4xl font-bold text-on-surface">Application Requirements & Pricing</h2>
            </div>
            <div className={`grid grid-cols-1 ${hasPayInFull ? 'md:grid-cols-2 max-w-4xl' : 'max-w-xl'} gap-8 mx-auto w-full`}>
              {/* Pay Now */}
              <div className="bg-red-50 rounded-2xl p-8 border border-red-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">payments</span>
                </div>
                <h3 className="font-bold text-xl text-red-600 mb-2">Pay Now</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-on-surface">£{payNowAmount}</span>
                  <span className="text-sm text-on-surface-variant"> today</span>
                </div>
                <div className="text-sm text-on-surface-variant mb-6 flex-grow flex flex-col gap-3 w-full text-left bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20">
                  <span className="font-bold text-on-surface mb-1 text-base">Total: £{totalAmount}</span>
                  {payNowPoints.map((pt, idx) => (
                    <span key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span> 
                      <span>{resolvePointText(pt, payNowAmount, '£')}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pay in Full */}
              {hasPayInFull && (
                <div className="bg-white rounded-2xl p-8 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {discountAmount > 0 ? `Save £${discountAmount.toFixed(0)}` : `${discountPercentage}% Off`}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4 mt-2">
                    <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                  </div>
                  <h3 className="font-bold text-xl text-on-surface mb-2">Pay in Full</h3>
                  <div className="mb-4 flex items-end justify-center gap-2">
                    <span className="text-xl text-on-surface-variant/60 line-through mb-1">£{totalAmount}</span>
                    <span className="text-4xl font-bold text-on-surface">£{payInFullAmount}</span>
                  </div>
                  <div className="text-sm text-on-surface-variant mb-6 flex-grow flex flex-col gap-3 w-full text-left bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20">
                    <span className="font-bold mb-1 text-base">Total: £{payInFullAmount}</span>
                    {payInFullPoints.map((pt, idx) => (
                      <span key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span> 
                        <span>{resolvePointText(pt, payInFullAmount, '£')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="w-full h-px bg-outline-variant/30 my-8"></div>

          {/* Section 2: Applicant Category & Documents / Query */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-start gap-6">
              
              {/* Applicant Category Selection Card */}
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">category</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-xl font-bold text-on-surface">Applicant Category</h2>
                    <p className="text-xs text-on-surface-variant">Select your category to view specific requirements</p>
                  </div>
                </div>
                
                <div className={getCategoryGridClass()}>
                  {activeCategoriesList.map(cat => (
                    <button 
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        if (cat.key === 'other') {
                          setQueryStep(1);
                        }
                      }}
                      className={`${getCategoryItemClass(cat.key)} rounded-xl p-4 flex flex-col items-center gap-2 transition-all shadow-sm focus:outline-none ${
                        selectedCategory === cat.key 
                          ? 'bg-primary/10 border-2 border-primary text-primary font-bold shadow-md scale-[1.02]' 
                          : 'bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                      <span className="font-bold text-xs uppercase tracking-wider">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visa Category Selection Card */}
              {selectedCategory && selectedCategory !== 'other' && (
                <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">flight_takeoff</span>
                    </div>
                    <div>
                      <h2 className="font-headline text-xl font-bold text-on-surface">Visa Category</h2>
                      <p className="text-xs text-on-surface-variant">
                        {activeVisaCategoriesList.length === 1 ? 'Available visa type for this selection' : 'Select your travel visa category'}
                      </p>
                    </div>
                  </div>

                  {activeVisaCategoriesList.length === 1 ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5 text-primary font-bold shadow-sm">
                      <span className="material-symbols-outlined text-xl">{activeVisaCategoriesList[0].icon}</span>
                      <span className="text-sm">{activeVisaCategoriesList[0].label}</span>
                      <span className="material-symbols-outlined ml-auto text-primary">check_circle</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {activeVisaCategoriesList.map(vc => (
                        <label 
                          key={vc.key} 
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedVisaCategory === vc.key 
                              ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' 
                              : 'border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 text-on-surface'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="visa_cat" 
                            className="text-primary focus:ring-primary h-5 w-5 accent-primary" 
                            checked={selectedVisaCategory === vc.key}
                            onChange={() => setSelectedVisaCategory(vc.key)}
                          />
                          <span className="text-sm font-semibold">{vc.label}</span>
                          <span className={`material-symbols-outlined ml-auto ${selectedVisaCategory === vc.key ? 'text-primary' : 'text-on-surface-variant'}`}>{vc.icon}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column: Query Form or Documents Required */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-outline-variant/30 shadow-sm flex flex-col h-full">
              {selectedCategory === 'other' ? (
                renderQueryFlow(true)
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface">
                      <span className="material-symbols-outlined">
                        {activeTab === 'query' ? 'help_outline' : 'description'}
                      </span>
                    </div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface">
                      {activeTab === 'query' ? 'Query & Consultation Form' : 'Documents Required'}
                    </h2>
                  </div>

                  <div className="flex border-b border-outline-variant/30 mb-6">
                    <button 
                      className={`px-6 py-3 font-bold transition-colors relative ${activeTab === 'now' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setActiveTab('now')}
                    >
                      Required Now
                      {activeTab === 'now' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary"></div>}
                    </button>
                    {docsRequiredLater.length > 0 && (
                      <button 
                        className={`px-6 py-3 font-bold transition-colors relative ${activeTab === 'later' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                        onClick={() => setActiveTab('later')}
                      >
                        Required Later
                        {activeTab === 'later' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary"></div>}
                      </button>
                    )}
                    {queryFormDocs.length > 0 && (
                      <button 
                        className={`px-6 py-3 font-bold transition-colors relative ${activeTab === 'query' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                        onClick={() => {
                          setActiveTab('query');
                          setQueryStep(1);
                        }}
                      >
                        Query Form
                        {activeTab === 'query' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary"></div>}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 flex-grow">
                    {activeTab === 'now' ? (
                      docsRequiredNow.length > 0 ? (
                        docsRequiredNow.map((doc, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30 transition-all">
                            <div className="mt-1 flex-shrink-0">
                              <span className="material-symbols-outlined text-primary">{doc.icon || 'check_circle'}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-1">{doc.name}</h4>
                              <p className="text-xs text-on-surface-variant leading-relaxed">{doc.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/30 border-dashed">
                          <p className="text-on-surface-variant text-sm">No specific documents required now for this combination.</p>
                        </div>
                      )
                    ) : activeTab === 'later' ? (
                      (!selectedCategory) ? (
                        <div className="text-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/30 border-dashed">
                          <p className="text-on-surface-variant text-sm">Select an applicant category to view documents required later.</p>
                        </div>
                      ) : docsRequiredLater.length > 0 ? (
                        docsRequiredLater.map((doc, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-secondary/30 transition-all">
                            <div className="mt-1 flex-shrink-0">
                              <span className="material-symbols-outlined text-secondary">{doc.icon || 'description'}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-1">{doc.name}</h4>
                              <p className="text-xs text-on-surface-variant leading-relaxed">{doc.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/30 border-dashed">
                          <p className="text-on-surface-variant text-sm">No specific documents required later for this combination.</p>
                        </div>
                      )
                    ) : (
                      renderQueryFlow(false)
                    )}
                  </div>
                </>
              )}
              <span className='mx-2 mt-8 text-xs text-on-surface-variant flex items-center gap-1.5'>
                <span className="material-symbols-outlined text-sm text-primary">info</span>
                Note: Case to Case Additional Documents May be required. If Required Our Executive will reach you.
              </span>
            </div>
          </section>

          {/* Bottom CTA Banner */}
          <div className="border-t border-outline-variant/30 pt-16 text-center max-w-2xl mx-auto space-y-6">
            <h2 className="font-headline text-3xl font-bold text-on-surface">Ready to begin your journey?</h2>
            <p className="text-on-surface-variant">
              Our streamlined process makes applying for your visa simple and secure. 
              Gather your core documents and start today.
            </p>
            <button 
              onClick={handleStartApplication}
              className="mt-4 bg-[#ff4d85] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-[#ff4d85]/30 hover:shadow-[#ff4d85]/50 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              Start Application Now
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ChecklistPage;
