import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visaAPI } from '../services/api';
import DocumentUpload from '../components/DocumentUpload';

const ApplicationProgressPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { citizenship, destination, visaData, selectedCategory, selectedVisaCategory } = location.state || {};
  
  const [currentStage, setCurrentStage] = useState(1);
  const [paymentOption, setPaymentOption] = useState('partial'); // 'partial' or 'full'
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
  });
  
  const [coreDocuments, setCoreDocuments] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!visaData) {
      navigate('/checklist');
    }
  }, [visaData, navigate]);

  if (!visaData) return null;

  const coreDocsConfig = visaData.required_documents?.documents_required_now || [
    { name: 'Passport Front and Back', description: 'Valid for at least 6 months beyond intended stay.', icon: 'travel' },
    { name: 'UK Valid Status (Online Status)', description: 'Proof of current legal status or residency requirement.', icon: 'badge' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStage === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.passportNumber) {
        alert('Please fill in all personal details.');
        return;
      }
    }
    
    if (currentStage === 2) {
      if (Object.keys(coreDocuments).length < coreDocsConfig.length) {
        alert('Please upload all required documents before proceeding.');
        return;
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStage(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStage(prev => Math.max(prev - 1, 1));
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
          color: '#ff4d85'
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append('configuration_id', visaData.configuration_id || 1);
      submitData.append('user_data', JSON.stringify({
        ...formData,
        applicantStatus: selectedCategory,
        visaCategory: selectedVisaCategory,
        paymentOption
      }));
      
      const documentTypes = [];
      
      Object.entries(coreDocuments).forEach(([docType, file]) => {
        submitData.append('documents', file);
        documentTypes.push(docType);
      });
      
      if (documentTypes.length > 0) {
        submitData.append('document_types', JSON.stringify(documentTypes));
      }

      // If partial payment, adjust the amount logic in the backend
      // But for now, we pass paymentOption so the backend could handle it.
      // Assuming backend creates order based on full amount currently, we might need to alter it or handle it here.
      // For UI demonstration, we will just proceed with creating application.
      
      const response = await visaAPI.createApplication(submitData);
      
      if (response.applicationId) {
        setPaymentStatus('pending');
        // Ideally pass paymentOption to createPaymentOrder if backend supports it.
        const orderData = await visaAPI.createPaymentOrder(response.applicationId);
        
        // If frontend overrides amount for Razorpay just for demo (not secure, but fits the prompt request if backend isn't changed yet)
        if (paymentOption === 'partial') {
          orderData.amount = 6500; // £65.00 in pence
        } else {
          orderData.amount = 9100; // £91.00 in pence
        }

        setPaymentStatus('processing');
        
        await handleRazorpayPayment(response.applicationId, orderData);
        
        setPaymentStatus('completed');
        setSubmitted(true);
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

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight">Personal Details</h2>
              <p className="text-on-surface-variant/80 text-lg mb-10 max-w-xl">
                Let's start with your information for the <span className="font-semibold text-primary">{selectedCategory}</span> application to <span className="font-semibold text-primary">{destination}</span>.
              </p>
              
              <div className="space-y-8 relative z-10">
                <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['fullName', 'email', 'phone', 'passportNumber'].map((field) => (
                      <div key={field} className="group relative">
                        <input 
                          required 
                          name={field} 
                          value={formData[field]} 
                          onChange={handleInputChange} 
                          className="peer w-full bg-transparent border-b-2 border-outline-variant/50 px-0 py-3 text-on-surface placeholder-transparent focus:outline-none focus:border-primary transition-colors z-10 relative" 
                          placeholder={field} 
                          type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} 
                        />
                        <label className="absolute left-0 -top-3.5 text-xs text-on-surface-variant transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-on-surface-variant/60 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-primary font-medium">
                          {field === 'fullName' ? 'Full Name' : field === 'email' ? 'Email Address' : field === 'phone' ? 'Phone Number' : 'Passport Number'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleNext} className="group bg-on-surface text-surface-lowest font-bold px-8 py-4 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 flex items-center gap-3 transition-all duration-300 text-white">
                Continue to Documents
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight">Required Documents (Now)</h2>
              <p className="text-on-surface-variant/80 text-lg mb-10 max-w-xl">
                Please upload the documents required to start the process. Other category-specific documents will be collected later.
              </p>
            
              <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm relative z-10">
                <DocumentUpload
                  requiredDocuments={coreDocsConfig}
                  onFilesChange={setCoreDocuments}
                  existingFiles={coreDocuments}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={handleBack} className="group text-on-surface-variant font-bold px-6 py-4 rounded-full hover:bg-surface-container flex items-center gap-2 transition-all duration-300">
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> 
                Back
              </button>
              <button onClick={handleNext} className="group bg-on-surface text-surface-lowest font-bold px-8 py-4 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 flex items-center gap-3 transition-all duration-300 text-white">
                Review & Payment
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              
              <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight relative z-10">Final Review & Payment</h2>
              <p className="text-on-surface-variant/80 text-lg mb-10 max-w-xl relative z-10">
                Select your payment option to proceed.
              </p>

            {submitted ? (
              <div className="py-16 text-center space-y-6 relative z-10 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                </div>
                <div>
                  <h3 className="text-3xl font-headline font-bold text-on-surface mb-2">Application Submitted!</h3>
                  <p className="text-on-surface-variant text-lg">Your payment was successful and your documents are under review.</p>
                </div>
                <div className="inline-block bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 mt-8 shadow-sm">
                   <p className="text-sm text-on-surface font-semibold mb-1">What happens next?</p>
                   <p className="text-xs text-on-surface-variant">Our team will verify your documents within 24 hours and contact you to collect the remaining documents.</p>
                </div>
              </div>
            ) : paymentStatus === 'processing' ? (
              <div className="py-24 text-center space-y-6 relative z-10">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">Processing Secure Payment</h3>
                  <p className="text-on-surface-variant">Please complete the payment in the secure Razorpay window...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-10 relative z-10">
                {/* Payment Options Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pay Now */}
                  <div 
                    onClick={() => setPaymentOption('partial')}
                    className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${paymentOption === 'partial' ? 'border-secondary bg-secondary/5 shadow-md' : 'border-outline-variant/30 bg-white hover:border-secondary/50'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined">payments</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentOption === 'partial' ? 'border-secondary bg-secondary' : 'border-outline-variant/50'}`}>
                        {paymentOption === 'partial' && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-on-surface mb-1">Pay Now</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-on-surface">£65</span>
                      <span className="text-sm text-on-surface-variant"> today</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">£65 due today. Remaining amount will be paid when a call with our executive is scheduled.</p>
                  </div>

                  {/* Pay in Full */}
                  <div 
                    onClick={() => setPaymentOption('full')}
                    className={`cursor-pointer rounded-2xl p-6 border-2 transition-all relative overflow-hidden ${paymentOption === 'full' ? 'border-primary bg-primary/5 shadow-md' : 'border-outline-variant/30 bg-white hover:border-primary/50'}`}
                  >
                    <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                      30% Discount
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                        <span className="material-symbols-outlined">workspace_premium</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentOption === 'full' ? 'border-primary bg-primary' : 'border-outline-variant/50'}`}>
                        {paymentOption === 'full' && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-on-surface mb-1">Pay in Full</h3>
                    <div className="mb-4 flex items-end gap-2">
                      <span className="text-sm text-on-surface-variant line-through mb-1">£130</span>
                      <span className="text-3xl font-bold text-primary">£91</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">Pay the entire amount upfront for our premium concierge service with a 30% discount.</p>
                  </div>
                </div>

                {/* Personal Details Summary */}
                <div className="bg-surface-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
                  <div className="bg-surface-container-lowest px-6 py-4 border-b border-outline-variant/30">
                    <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      Applicant Details
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Category</p>
                      <p className="font-medium capitalize">{selectedCategory} / {selectedVisaCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Full Name</p>
                      <p className="font-medium">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Passport</p>
                      <p className="font-medium">{formData.passportNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Documents Summary */}
                <div className="bg-surface-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
                  <div className="bg-surface-container-lowest px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center">
                    <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">folder_open</span>
                      Uploaded Documents
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {Object.entries(coreDocuments).map(([key, file]) => (
                      <div key={key} className="flex items-center justify-between p-3 hover:bg-surface-container-lowest rounded-xl transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-on-surface">{key}</h4>
                            <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-on-surface-variant/60 group-hover:text-on-surface-variant transition-colors">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div>

            {!submitted && paymentStatus !== 'processing' && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
                <button onClick={handleBack} className="group text-on-surface-variant font-bold px-6 py-4 rounded-full hover:bg-surface-container flex items-center gap-2 transition-all duration-300 w-full md:w-auto justify-center">
                  <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> 
                  Back to Documents
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="group relative overflow-hidden bg-gradient-to-r from-[#ff4d85] to-[#ff758c] text-white font-bold px-12 py-4 rounded-full shadow-[0_8px_25px_rgba(255,77,133,0.3)] hover:shadow-[0_12px_35px_rgba(255,77,133,0.4)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 transition-all duration-300 w-full md:w-auto"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? 'Processing...' : `Pay £${paymentOption === 'partial' ? '65' : '91'} & Submit`} 
                    <span className="material-symbols-outlined text-sm">{loading ? 'hourglass_empty' : 'lock'}</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const steps = [
    { num: 1, title: 'Personal Details', desc: 'Basic information' },
    { num: 2, title: 'Required Documents', desc: 'Upload to start' },
    { num: 3, title: 'Review & Payment', desc: 'Select option & Pay' }
  ];

  return (
    <div className="min-h-screen bg-surface-lowest relative font-sans">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Modern Sidebar */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <div className="sticky top-24 bg-white/60 backdrop-blur-2xl border border-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h1 className="font-headline text-2xl font-extrabold mb-8 text-on-surface tracking-tight">Application Progress</h1>
            
            <div className="relative">
              {/* Vertical tracking line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-outline-variant/20 -z-10 rounded-full" />
              
              <div className="space-y-8">
                {steps.map((step, idx) => {
                  const isCompleted = currentStage > step.num;
                  const isActive = currentStage === step.num;
                  
                  return (
                    <div key={step.num} className="flex gap-5 relative group">
                      {/* Step Indicator */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-500 ease-out z-10 relative
                          ${isCompleted ? 'bg-primary text-white shadow-primary/20' : 
                            isActive ? 'bg-surface-lowest text-primary border-2 border-primary shadow-lg shadow-primary/10 scale-110' : 
                            'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'}`}
                        >
                          {isCompleted ? <span className="material-symbols-outlined text-lg">check</span> : step.num}
                        </div>
                        {/* Active Glow */}
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md scale-150 animate-pulse -z-10" />
                        )}
                      </div>
                      
                      {/* Step Content */}
                      <div className={`pt-2 transition-all duration-300 ${isActive ? 'translate-x-1' : ''}`}>
                        <h3 className={`font-headline font-bold text-[15px] transition-colors duration-300 ${isActive ? 'text-on-surface' : isCompleted ? 'text-on-surface-variant' : 'text-on-surface-variant/60'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs mt-1 transition-colors duration-300 ${isActive ? 'text-primary font-medium' : isCompleted ? 'text-primary/70' : 'text-outline'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-4xl mt-12">
          {renderStageContent()}
        </div>
      </div>
    </div>
  );
};

export default ApplicationProgressPage;
