import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visaAPI } from '../services/api';
import DocumentUpload from '../components/DocumentUpload';

const ApplicationProgressPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { citizenship, destination, visaData } = location.state || {};
  
  const [currentStage, setCurrentStage] = useState(1);
  const [applicantStatus, setApplicantStatus] = useState(null); // 'student', 'employed', 'visiting', 'sponsored'
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
  });
  
  const [coreDocuments, setCoreDocuments] = useState({});
  const [categoryDocuments, setCategoryDocuments] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!visaData) {
      navigate('/checklist');
    }
  }, [visaData, navigate]);

  if (!visaData) return null;

  const coreDocsConfig = visaData.required_documents?.core_documents || [];
  const categoryDocsConfig = applicantStatus 
    ? (visaData.required_documents?.category_specific?.[applicantStatus] || []) 
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStage === 1) {
      if (Object.keys(coreDocuments).length < coreDocsConfig.length) {
        alert('Please upload all required basic documents before proceeding.');
        return;
      }
      if (!formData.fullName || !formData.email || !formData.phone || !formData.passportNumber) {
        alert('Please fill in all personal details.');
        return;
      }
    }
    
    if (currentStage === 2) {
      if (!applicantStatus) {
        alert('Please select an applicant status.');
        return;
      }
    }
    
    if (currentStage === 3) {
      if (Object.keys(categoryDocuments).length < categoryDocsConfig.length) {
        alert('Please upload all required category documents before proceeding.');
        return;
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStage(prev => Math.min(prev + 1, 4));
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
        applicantStatus
      }));
      
      const allFiles = { ...coreDocuments, ...categoryDocuments };
      const documentTypes = [];
      
      Object.entries(allFiles).forEach(([docType, file]) => {
        submitData.append('documents', file);
        documentTypes.push(docType);
      });
      
      if (documentTypes.length > 0) {
        submitData.append('document_types', JSON.stringify(documentTypes));
      }

      const response = await visaAPI.createApplication(submitData);
      
      if (response.applicationId) {
        setPaymentStatus('pending');
        const orderData = await visaAPI.createPaymentOrder(response.applicationId);
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

  const calculateTotalFee = (serviceFee) => {
    if (typeof serviceFee === 'object' && serviceFee !== null) {
      return (serviceFee.admin_fee || 0) + (serviceFee.service_fee || 0) + (serviceFee.express_fee || 0);
    }
    return parseFloat(serviceFee) || 133.00;
  };
  const totalServiceFee = calculateTotalFee(visaData.service_fee);

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight">Basic Documents</h2>
              <p className="text-on-surface-variant/80 text-lg mb-10 max-w-xl">
                Let's start with the essentials. These documents are required for all applicants heading to <span className="font-semibold text-primary">{destination}</span>.
              </p>
              
              <div className="space-y-8 relative z-10">
                <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <h3 className="font-headline font-bold text-xl">Personal Details</h3>
                  </div>
                  
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

                <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">upload_file</span>
                    </div>
                    <h3 className="font-headline font-bold text-xl">Core Uploads</h3>
                  </div>
                  <DocumentUpload
                    requiredDocuments={coreDocsConfig}
                    onFilesChange={setCoreDocuments}
                    existingFiles={coreDocuments}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleNext} className="group bg-on-surface text-surface-lowest font-bold px-8 py-4 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 flex items-center gap-3 transition-all duration-300 text-white">
                Continue to Status
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
              
              <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight">Applicant Status</h2>
              <p className="text-on-surface-variant/80 text-lg mb-10 max-w-xl">
                Select your primary purpose of travel. This will tailor the specific documents required for the next stage.
              </p>
            
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto py-4 relative z-10">
                {[
                  { id: 'student', icon: 'school', label: 'Student', desc: 'Traveling for education or study programs' },
                  { id: 'employed', icon: 'work', label: 'Employee', desc: 'Traveling for work, business, or meetings' },
                  { id: 'visiting', icon: 'flight_takeoff', label: 'Visiting', desc: 'Tourism, visiting friends or family' },
                  { id: 'sponsored', icon: 'handshake', label: 'Sponsored', desc: 'Traveling with an official sponsor' }
                ].map(status => (
                  <button
                    key={status.id}
                    onClick={() => setApplicantStatus(status.id)}
                    className={`group relative flex flex-col items-start p-8 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden ${
                      applicantStatus === status.id 
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 -translate-y-1' 
                        : 'border-outline-variant/30 bg-surface-lowest hover:border-primary/40 hover:bg-surface-container-lowest hover:shadow-md hover:-translate-y-1'
                    }`}
                  >
                    {applicantStatus === status.id && (
                      <div className="absolute top-4 right-4 text-primary animate-in zoom-in duration-300">
                        <span className="material-symbols-outlined filled">check_circle</span>
                      </div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                      applicantStatus === status.id ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      <span className="material-symbols-outlined text-2xl">{status.icon}</span>
                    </div>
                    <span className={`font-headline font-bold text-xl mb-2 transition-colors ${applicantStatus === status.id ? 'text-primary' : 'text-on-surface'}`}>
                      {status.label}
                    </span>
                    <span className="text-sm text-on-surface-variant leading-relaxed">
                      {status.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={handleBack} className="group text-on-surface-variant font-bold px-6 py-4 rounded-full hover:bg-surface-container flex items-center gap-2 transition-all duration-300">
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> 
                Back
              </button>
              <button 
                onClick={handleNext} 
                disabled={!applicantStatus}
                className="group bg-on-surface text-surface-lowest font-bold px-8 py-4 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-3 transition-all duration-300"
              >
                Confirm Selection 
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className="px-3 py-1 bg-tertiary/10 text-tertiary font-bold text-xs rounded-full uppercase tracking-widest">
                  {applicantStatus}
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight relative z-10">Specific Documents</h2>
              <p className="text-on-surface-variant/80 text-lg mb-10 max-w-xl relative z-10">
                Based on your selection, please provide the following specific documents to strengthen your application.
              </p>

              <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm relative z-10">
                <DocumentUpload
                  requiredDocuments={categoryDocsConfig}
                  onFilesChange={setCategoryDocuments}
                  existingFiles={categoryDocuments}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={handleBack} className="group text-on-surface-variant font-bold px-6 py-4 rounded-full hover:bg-surface-container flex items-center gap-2 transition-all duration-300">
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> 
                Back
              </button>
              <button onClick={handleNext} className="group bg-on-surface text-surface-lowest font-bold px-8 py-4 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 flex items-center gap-3 transition-all duration-300 text-white">
                Review Application 
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              
              <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight relative z-10">Final Review</h2>
              <p className="text-on-surface-variant/80 text-lg mb-10 max-w-xl relative z-10">
                Please double-check your uploaded documents and details before final submission.
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
                   <p className="text-xs text-on-surface-variant">Our team will verify your documents within 24 hours and contact you via email.</p>
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
                {/* Personal Details Summary */}
                <div className="bg-surface-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
                  <div className="bg-surface-container-lowest px-6 py-4 border-b border-outline-variant/30">
                    <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      Personal Details
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Full Name</p>
                      <p className="font-medium">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Phone</p>
                      <p className="font-medium">{formData.phone}</p>
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
                    <span className="bg-green-500/10 text-green-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">done_all</span> All required attached
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    {Object.entries({...coreDocuments, ...categoryDocuments}).map(([key, file]) => (
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
                  
                {/* Payment Summary */}
                <div className="bg-gradient-to-r from-[#ff4d85] to-[#ff758c] p-1 rounded-2xl shadow-lg shadow-primary/20">
                  <div className="bg-white rounded-xl p-6 h-full">
                    {/* Price Breakup */}
                    <div className="space-y-3 mb-4">
                      {visaData.service_fee?.admin_fee > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">receipt</span>
                            <span className="text-sm text-on-surface-variant">Admin Fee</span>
                          </div>
                          <span className="text-sm font-medium text-on-surface">£{visaData.service_fee.admin_fee.toFixed(2)}</span>
                        </div>
                      )}
                      {visaData.service_fee?.service_fee > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">handshake</span>
                            <span className="text-sm text-on-surface-variant">Service Fee</span>
                          </div>
                          <span className="text-sm font-medium text-on-surface">£{visaData.service_fee.service_fee.toFixed(2)}</span>
                        </div>
                      )}
                      {visaData.service_fee?.express_fee > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">bolt</span>
                            <span className="text-sm text-on-surface-variant">Express Processing</span>
                          </div>
                          <span className="text-sm font-medium text-on-surface">£{visaData.service_fee.express_fee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-outline-variant/30 pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-on-surface uppercase tracking-wider">Total</span>
                          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d85] to-[#ff758c]">
                            £{totalServiceFee.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant/70">Includes all taxes and processing charges</p>
                  </div>
                </div>
              </div>
            )}
            </div>

            {!submitted && paymentStatus !== 'processing' && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
                <button onClick={handleBack} className="group text-on-surface-variant font-bold px-6 py-4 rounded-full hover:bg-surface-container flex items-center gap-2 transition-all duration-300 w-full md:w-auto justify-center">
                  <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> 
                  Edit Details
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="group relative overflow-hidden bg-gradient-to-r from-[#ff4d85] to-[#ff758c] text-white font-bold px-12 py-4 rounded-full shadow-[0_8px_25px_rgba(255,77,133,0.3)] hover:shadow-[0_12px_35px_rgba(255,77,133,0.4)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 transition-all duration-300 w-full md:w-auto"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? 'Processing...' : 'Pay & Submit Application'} 
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
    { num: 1, title: 'Basic Documents', desc: 'Core requirements' },
    { num: 2, title: 'Applicant Status', desc: applicantStatus ? `Selected: ${applicantStatus}` : 'Determine specific needs' },
    { num: 3, title: 'Specific Uploads', desc: 'Tailored documents' },
    { num: 4, title: 'Review & Submit', desc: 'Final verification' }
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
