import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visaAPI } from '../services/api';

const ChecklistPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visaData, setVisaData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
        visaData 
      } 
    });
  };

  const coreDocs = visaData?.required_documents?.core_documents || [
    { name: 'Passport Front and Back', description: 'Valid for at least 6 months beyond intended stay.' },
    { name: 'Biometric Residence Permit', description: 'If applicable, from your current country of residence.' },
    { name: 'Bank Statement', description: 'Last 3-6 months showing sufficient funds for your stay.' }
  ];

  const categoryDocs = visaData?.required_documents?.category_specific || {};

  const categories = [
    { key: 'student', label: 'Student', icon: 'school' },
    { key: 'employed', label: 'Employed', icon: 'work' },
    { key: 'sponsored', label: 'Sponsored', icon: 'handshake' },
    { key: 'visiting', label: 'Tourist', icon: 'flight_takeoff' }
  ];

  const handleCategoryClick = (categoryKey) => {
    setSelectedCategory(categoryKey);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

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
          <div className="text-center">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">Application Requirements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Core Documents Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-outline-variant/30 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">description</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface">Core Documents</h3>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">
                These essential documents are required for all applicants, regardless of your specific visa category.
              </p>
              <div className="space-y-3 flex-1">
                {coreDocs.map((doc, idx) => (
                  <div key={idx} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 flex gap-4">
                    <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">{doc.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Specific Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-outline-variant/30 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">category</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface">Category Specific</h3>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">
                Additional documentation is required based on your primary purpose of travel to {destination}.
              </p>
              
              {!selectedCategory ? (
                <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => handleCategoryClick(cat.key)}
                      className="flex flex-col items-center justify-center p-4 border border-outline-variant/20 rounded-xl bg-surface-lowest shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant mb-2">{cat.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface">{cat.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-1">
                  <button
                    onClick={handleBackToCategories}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-4 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to categories
                  </button>
                  <h4 className="font-bold text-on-surface mb-4 capitalize">{categories.find(c => c.key === selectedCategory)?.label} Documents</h4>
                  <div className="space-y-3">
                    {(categoryDocs[selectedCategory] || []).map((doc, idx) => (
                      <div key={idx} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 flex gap-4">
                        <span className="material-symbols-outlined text-secondary mt-0.5">check_circle</span>
                        <div>
                          <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">{doc.name}</h4>
                          <p className="text-xs text-on-surface-variant mt-1">{doc.description}</p>
                        </div>
                      </div>
                    ))}
                    {(categoryDocs[selectedCategory] || []).length === 0 && (
                      <p className="text-on-surface-variant text-sm">No specific documents required for this category.</p>
                    )}
                  </div>
                </div>
              )}

              {!selectedCategory && (
                <div className="mt-6 bg-primary/5 p-4 rounded-xl text-center">
                  <p className="text-sm text-on-surface-variant">
                    Click a category above to see required documents.
                  </p>
                </div>
              )}
            </div>
          </div>

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
