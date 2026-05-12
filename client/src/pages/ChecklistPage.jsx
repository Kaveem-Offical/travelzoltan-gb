import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visaAPI } from '../services/api';

const ChecklistPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visaData, setVisaData] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('employed');
  const [selectedVisaCategory, setSelectedVisaCategory] = useState('tourist');
  const [activeTab, setActiveTab] = useState('now');

  const citizenship = location.state?.citizenship || 'United Kingdom';
  const destination = location.state?.destination || 'Europe (Schengen States)';

  useEffect(() => {
    fetchVisaRequirements();
  }, [citizenship, destination]);

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
    navigate('/apply', { 
      state: { 
        citizenship, 
        destination, 
        visaData,
        selectedCategory,
        selectedVisaCategory
      } 
    });
  };

  const docsRequiredNow = visaData?.required_documents?.documents_required_now || [
    { name: 'Passport Front and Back', description: 'Valid for at least 6 months beyond intended stay.', icon: 'travel' },
    { name: 'UK Valid Status (Online Status)', description: 'Proof of current legal status or residency requirement.', icon: 'badge' }
  ];

  const applicantDocs = visaData?.required_documents?.required_later?.applicant_category || {};
  const visaDocs = visaData?.required_documents?.required_later?.visa_category || {};

  const docsRequiredLater = [
    ...(applicantDocs[selectedCategory] || []),
    ...(visaDocs[selectedVisaCategory] || [])
  ];

  const categories = [
    { key: 'student', label: 'Student', icon: 'school' },
    { key: 'employed', label: 'Employed', icon: 'work' },
    { key: 'self_employed', label: 'Self-Employed', icon: 'handshake' },
    { key: 'unemployed', label: 'Unemployed', icon: 'person_off' },
    { key: 'other', label: 'Other / Query', icon: 'more_horiz' }
  ];

  const visaCategories = [
    { key: 'tourist', label: 'Tourist', icon: 'flight_takeoff' },
    { key: 'visiting', label: 'Visit (Family/Friend)', icon: 'family_restroom' }
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-24 bg-surface-lowest">
      {/* Hero Header */}
      <header className="relative mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-primary/10 text-primary border border-primary/20 rounded-full">
              Digital Curator
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 leading-[1.1]">
              Document Checklist for <span className="text-primary">{citizenship}</span>
            </h1>
            <p className="text-xl text-on-surface-variant font-light max-w-lg leading-relaxed">
              Traveling to {destination}. Our premium concierge service ensures your visa application is seamless, fast, and 100% compliant.
            </p>
          </div>
          <div className="relative">
            <div className="asymmetric-image w-full h-[400px] rounded-xl overflow-hidden shadow-2xl">
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
          <p className="mt-4 text-on-surface-variant">Loading visa requirements...</p>
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-8 rounded-lg mb-12">
          <h3 className="font-bold mb-2">Error Loading Requirements</h3>
          <p>{error}</p>
          <button 
            onClick={fetchVisaRequirements}
            className="mt-4 bg-error text-on-error px-6 py-2 rounded-lg hover:opacity-90"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
              {/* Pay Now */}
              <div className="bg-white rounded-2xl p-8 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">payments</span>
                </div>
                <h3 className="font-bold text-xl text-on-surface mb-2">Pay Now</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-on-surface">£65</span>
                  <span className="text-sm text-on-surface-variant"> today</span>
                </div>
                <div className="text-sm text-on-surface-variant mb-6 flex-grow flex flex-col gap-3 w-full text-left bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20">
                  <span className="font-bold text-on-surface mb-1 text-base">Total: £130</span>
                  <span className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span> 
                    <span>£65 due today to start process</span>
                  </span>
                  <span className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span> 
                    <span>Remaining amount paid upon call with executive</span>
                  </span>
                </div>
              </div>

              {/* Pay in Full */}
              <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  30% Discount
                </div>
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mb-4 mt-2">
                  <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                </div>
                <h3 className="font-bold text-xl text-primary mb-2">Pay in Full</h3>
                <div className="mb-4 flex items-end justify-center gap-2">
                  <span className="text-xl text-primary/60 line-through mb-1">£130</span>
                  <span className="text-4xl font-bold text-primary">£91</span>
                </div>
                <div className="text-sm text-primary mb-6 flex-grow flex flex-col gap-3 w-full text-left bg-white/60 rounded-xl p-5 border border-primary/20">
                  <span className="font-bold mb-1 text-base">Total: £91</span>
                  <span className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span> 
                    <span>Pay entire amount upfront</span>
                  </span>
                  <span className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span> 
                    <span>Premium concierge service included</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="w-full h-px bg-outline-variant/30 my-8"></div>

          {/* Section 2: Applicant Category & Documents */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">category</span>
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">Applicant Category</h2>
              </div>
              <p className="text-on-surface-variant">Select your category to view specific document requirements.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                  <button 
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`col-span-${cat.key === 'other' ? '2' : '1'} rounded-xl p-4 flex flex-col items-center gap-2 transition-all shadow-sm focus:outline-none ${selectedCategory === cat.key ? 'bg-primary/10 border-2 border-primary text-primary' : 'bg-white border border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 text-on-surface-variant'}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                    <span className="font-bold text-sm uppercase tracking-wider">{cat.label}</span>
                  </button>
                ))}
              </div>

              {selectedCategory && selectedCategory !== 'other' && (
                <div className="mt-4 bg-white rounded-xl p-6 border border-outline-variant/30 shadow-sm">
                  <h4 className="font-bold text-on-surface mb-4">Select Visa Category</h4>
                  <div className="flex flex-col gap-3">
                    {visaCategories.map(vc => (
                      <label key={vc.key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedVisaCategory === vc.key ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/50'}`}>
                        <input 
                          type="radio" 
                          name="visa_cat" 
                          className="text-primary focus:ring-primary h-5 w-5 accent-primary" 
                          checked={selectedVisaCategory === vc.key}
                          onChange={() => setSelectedVisaCategory(vc.key)}
                        />
                        <span className="font-bold text-on-surface">{vc.label}</span>
                        <span className={`material-symbols-outlined ml-auto ${selectedVisaCategory === vc.key ? 'text-primary' : 'text-on-surface-variant'}`}>{vc.icon}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-outline-variant/30 shadow-sm flex flex-col h-full">
              {selectedCategory === 'other' ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">help_center</span>
                    </div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface">Special Category Query</h2>
                  </div>
                  <p className="text-on-surface-variant">Please provide details about your situation (e.g., minor, group member, special visa type) and our team will guide you.</p>
                  
                  <form className="flex flex-col gap-4 mt-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">Query Type</label>
                      <select className="w-full p-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-lowest">
                        <option>Group Member Application</option>
                        <option>Application for a Minor</option>
                        <option>Other Special Category</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">Message / Details</label>
                      <textarea rows="4" className="w-full p-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-lowest" placeholder="Explain your requirements..."></textarea>
                    </div>
                    <button className="bg-primary text-white font-bold py-3 rounded-xl mt-2 hover:opacity-90 transition-opacity">Submit Query</button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface">Documents Required</h2>
                  </div>

                  <div className="flex border-b border-outline-variant/30 mb-6">
                    <button 
                      className={`px-6 py-3 font-bold transition-colors relative ${activeTab === 'now' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setActiveTab('now')}
                    >
                      Required Now
                      {activeTab === 'now' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary"></div>}
                    </button>
                    <button 
                      className={`px-6 py-3 font-bold transition-colors relative ${activeTab === 'later' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setActiveTab('later')}
                    >
                      Required Later
                      {activeTab === 'later' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary"></div>}
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 flex-grow">
                    {activeTab === 'now' ? (
                      docsRequiredNow.map((doc, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                          <div className="mt-1 flex-shrink-0">
                            <span className="material-symbols-outlined text-primary">{doc.icon || 'check_circle'}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-1">{doc.name}</h4>
                            <p className="text-xs text-on-surface-variant">{doc.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                       (!selectedCategory) ? (
                         <div className="text-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/30 border-dashed">
                           <p className="text-on-surface-variant text-sm">Select an applicant category to view documents required later.</p>
                         </div>
                       ) : docsRequiredLater.length > 0 ? (
                         docsRequiredLater.map((doc, idx) => (
                           <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                            <div className="mt-1 flex-shrink-0">
                              <span className="material-symbols-outlined text-secondary">{doc.icon || 'description'}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-1">{doc.name}</h4>
                              <p className="text-xs text-on-surface-variant">{doc.description}</p>
                            </div>
                          </div>
                         ))
                       ) : (
                         <div className="text-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/30 border-dashed">
                           <p className="text-on-surface-variant text-sm">No specific documents required for this combination.</p>
                         </div>
                       )
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <div className="border-t border-outline-variant/30 pt-16 text-center max-w-2xl mx-auto space-y-6">
            <h2 className="font-headline text-3xl font-bold text-on-surface">Ready to begin your journey?</h2>
            <p className="text-on-surface-variant">
              Our streamlined process makes applying for your visa simple and secure. 
              Gather your core documents and start today.
            </p>
            <button 
              onClick={handleStartApplication}
              className="mt-4 bg-[#ff4d85] text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg shadow-[#ff4d85]/30 hover:shadow-[#ff4d85]/50 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 mx-auto"
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
