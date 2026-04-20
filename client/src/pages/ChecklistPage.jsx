import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { visaAPI } from '../services/api';
import DocumentUpload from '../components/DocumentUpload';

const ChecklistPage = () => {
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visaData, setVisaData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  const [applicationId, setApplicationId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
  });
  const [documentFiles, setDocumentFiles] = useState({});

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentFilesChange = (files) => {
    setDocumentFiles(files);
  };

  const handleRazorpayPayment = async (appId, orderData) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ZoltanVisa',
        description: 'Visa Application Service Fee',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment on server
            const verifyData = {
              applicationId: appId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            
            await visaAPI.verifyPayment(verifyData);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!visaData) {
      alert('Visa configuration not loaded');
      return;
    }

    // Check if all required documents are uploaded
    const requiredDocs = visaData.required_documents || [];
    const uploadedCount = Object.keys(documentFiles).length;
    
    if (requiredDocs.length > 0 && uploadedCount < requiredDocs.length) {
      alert(`Please upload all ${requiredDocs.length} required documents before submitting`);
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('configuration_id', visaData.configuration_id);
      submitData.append('user_data', JSON.stringify(formData));
      
      // Append files and document types
      const documentTypes = [];
      Object.entries(documentFiles).forEach(([docType, file]) => {
        submitData.append('documents', file);
        documentTypes.push(docType);
      });
      
      // Add document types array
      if (documentTypes.length > 0) {
        submitData.append('document_types', JSON.stringify(documentTypes));
      }

      const response = await visaAPI.createApplication(submitData);
      
      console.log('Application created:', response);
      
      if (response.applicationId) {
        setApplicationId(response.applicationId);
        setPaymentStatus('pending');
        
        // Create Razorpay order
        const orderData = await visaAPI.createPaymentOrder(response.applicationId);
        
        setPaymentStatus('processing');
        
        // Open Razorpay checkout
        await handleRazorpayPayment(response.applicationId, orderData);
        
        // Payment successful
        setPaymentStatus('completed');
        setSubmitted(true);
        
        // Reset after delay
        setTimeout(() => {
          setSubmitted(false);
          setPaymentStatus('idle');
          setApplicationId(null);
          // Reset form
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            passportNumber: '',
          });
          setDocumentFiles({});
        }, 5000);
      }
    } catch (err) {
      if (err.message === 'Payment cancelled by user') {
        setPaymentStatus('failed');
        alert('Payment was cancelled. Your application is saved but payment is pending.');
      } else {
        alert(err.message || 'Failed to submit application or process payment');
      }
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };

  // Default documents if API fails
  const defaultDocuments = [
    { 
      icon: 'travel', 
      color: 'text-primary', 
      border: 'border-primary', 
      title: 'Original Passport', 
      desc: 'Must be valid for 6 months beyond departure date.' 
    },
    { 
      icon: 'photo_camera', 
      color: 'text-secondary', 
      border: 'border-secondary', 
      title: 'Biometric Photos', 
      desc: 'Two recent color photos (3.5 x 4.5 cm) on white background.' 
    },
    { 
      icon: 'description', 
      color: 'text-tertiary', 
      border: 'border-tertiary', 
      title: 'Travel Insurance', 
      desc: 'Proof of medical insurance covering €30,000 min.' 
    },
    { 
      icon: 'home_work', 
      color: 'text-primary-container', 
      border: 'border-primary-container', 
      title: 'Proof of Residency', 
      desc: 'Valid UK residence permit (BRP) or equivalent.' 
    },
  ];

  const documents = visaData?.required_documents || defaultDocuments;

  // Helper to calculate total fee from breakdown
  const calculateTotalFee = (serviceFee) => {
    if (typeof serviceFee === 'object' && serviceFee !== null) {
      return (serviceFee.admin_fee || 0) + (serviceFee.service_fee || 0) + (serviceFee.express_fee || 0);
    }
    return parseFloat(serviceFee) || 133.00;
  };

  const serviceFeeBreakdown = visaData?.service_fee || { admin_fee: 68, service_fee: 45, express_fee: 20 };
  const totalServiceFee = calculateTotalFee(serviceFeeBreakdown);

  return (
    <main className="max-w-7xl mx-auto px-6 py-24">
      {/* Hero Header */}
      <header className="relative mb-24">
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
            <div className="asymmetric-image w-full h-[500px] rounded-xl overflow-hidden shadow-2xl">
              <img 
                alt="Scenic European street" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80" 
              />
            </div>
            <div className="absolute -bottom-8 -left-8 glass p-8 rounded-lg shadow-xl border border-white/40 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <div className="text-sm font-bold font-headline">99.8% Success Rate</div>
                  <div className="text-xs text-on-surface-variant">Verified by 5,000+ travelers</div>
                </div>
              </div>
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
        <>
          {/* Requirements & Cost */}
          <section className="mb-24">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-end justify-between mb-8">
                  <h2 className="font-headline text-3xl font-bold tracking-tight">Documents Required</h2>
                  <span className="text-primary font-bold text-sm">
                    {Array.isArray(documents) ? documents.length : 4} Items Total
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.isArray(documents) ? documents.map((doc, idx) => {
                    // Handle both new API format (name, description, icon) and old default format (title, desc)
                    const docName = doc.name || doc.title || doc;
                    const docDesc = doc.description || doc.desc || 'Required document for visa application';
                    return (
                      <div
                        key={idx}
                        className={`bg-surface-container-lowest p-8 rounded-lg shadow-sm border-b-4 ${doc.border || 'border-primary'} transition-transform hover:-translate-y-2`}
                      >
                        <span className={`material-symbols-outlined ${doc.color || 'text-primary'} text-4xl mb-4`}>
                          {doc.icon || 'description'}
                        </span>
                        <h3 className="font-headline text-xl font-bold mb-2">{docName}</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          {docDesc}
                        </p>
                      </div>
                    );
                  }) : (
                    <p className="col-span-2 text-on-surface-variant">No documents information available</p>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-80 bg-surface-container-high rounded-xl p-8 flex flex-col justify-between self-start sticky top-28">
                <div>
                  <h2 className="font-headline text-2xl font-bold mb-6">Service Fees</h2>
                  <div className="space-y-4">
                    {/* Admin Fee - only show if added */}
                    {(serviceFeeBreakdown.admin_fee > 0) && (
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant">Admin Fee</span>
                        <span className="font-semibold">£{(serviceFeeBreakdown.admin_fee || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {/* Service Fee - only show if added */}
                    {(serviceFeeBreakdown.service_fee > 0) && (
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant">Processing Fee</span>
                        <span className="font-semibold">£{(serviceFeeBreakdown.service_fee || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {/* Express Fee - only show if added */}
                    {(serviceFeeBreakdown.express_fee > 0) && (
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant">Express Service</span>
                        <span className="font-semibold text-secondary">+ £{(serviceFeeBreakdown.express_fee || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-4 mt-4 border-t border-outline-variant flex justify-between items-center">
                      <span className="font-bold">Total Cost</span>
                      <span className="text-2xl font-headline font-black text-primary">
                        £{totalServiceFee.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-xs text-on-surface-variant italic">
                  *Fees may vary based on destination.
                </div>
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-surface-container-lowest rounded-lg p-10 shadow-sm">
                <h2 className="font-headline text-3xl font-bold mb-8">Start Your Application</h2>
                {submitted ? (
                  <div className="py-20 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                    <span className="material-symbols-outlined text-green-500 text-7xl">check_circle</span>
                    <h3 className="text-2xl font-bold">Application Submitted & Paid!</h3>
                    <p className="text-on-surface-variant">
                      Your payment has been received. Our team will review your documents and contact you within 24 hours.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 inline-block">
                      <p className="text-green-700 text-sm font-medium">
                        <span className="material-symbols-outlined inline-block mr-1 text-sm">payments</span>
                        Payment Status: Completed
                      </p>
                    </div>
                  </div>
                ) : paymentStatus === 'processing' ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <h3 className="text-xl font-bold">Processing Payment...</h3>
                    <p className="text-on-surface-variant">
                      Please complete the payment in the Razorpay window. Do not close this page.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface ml-1">Full Name</label>
                        <input 
                          required 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border-none rounded-DEFAULT p-4" 
                          placeholder="John Doe" 
                          type="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface ml-1">Email Address</label>
                        <input 
                          required 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border-none rounded-DEFAULT p-4" 
                          placeholder="john@example.com" 
                          type="email"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface ml-1">Phone Number</label>
                        <input 
                          required 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border-none rounded-DEFAULT p-4" 
                          placeholder="+44 20 1234 5678" 
                          type="tel"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface ml-1">Passport Number</label>
                        <input 
                          required 
                          name="passportNumber"
                          value={formData.passportNumber}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border-none rounded-DEFAULT p-4" 
                          placeholder="AB1234567" 
                          type="text"
                        />
                      </div>
                    </div>
                    <DocumentUpload
                      requiredDocuments={documents}
                      onFilesChange={handleDocumentFilesChange}
                    />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8">
                      <div className="bg-surface-container px-6 py-4 rounded-lg flex items-center gap-4">
                        <input 
                          type="checkbox" 
                          required 
                          className="rounded border-primary text-primary focus:ring-primary" 
                        />
                        <span className="text-sm text-on-surface-variant">I agree to terms and conditions</span>
                      </div>
                      <button 
                        className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-lg font-bold px-12 py-5 rounded-full shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading 
                          ? (paymentStatus === 'processing' 
                            ? 'Waiting for Payment...' 
                            : 'Submitting...') 
                          : 'Submit & Pay Now'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar Support */}
            <div className="space-y-8">
              <div className="bg-primary text-on-primary p-10 rounded-lg shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-headline text-2xl font-bold mb-4">Need Expert Advice?</h3>
                  <p className="text-white/80 mb-8 font-light">Available 24/7 to guide you.</p>
                  <div className="space-y-4">
                    <a className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors group" href="#">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">chat</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">WhatsApp</div>
                        <div className="text-xs opacity-70">Instant response</div>
                      </div>
                    </a>
                    <a className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors group" href="#">
                      <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">call</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">Priority Phone</div>
                        <div className="text-xs opacity-70">+44 20 1234 5678</div>
                      </div>
                    </a>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              </div>
              <div className="p-8 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <h4 className="font-headline font-bold mb-4">Why choose us?</h4>
                <ul className="space-y-4 text-sm text-on-surface-variant">
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">done_all</span>
                    Official Embassy partner
                  </li>
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">done_all</span>
                    End-to-end verification
                  </li>
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">done_all</span>
                    Premium courier included
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default ChecklistPage;
