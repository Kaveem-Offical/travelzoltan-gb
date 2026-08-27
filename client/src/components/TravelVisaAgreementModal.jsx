import React, { useRef } from 'react';
import { 
  AGREEMENT_TITLE, 
  AGREEMENT_SUBTITLE, 
  AGREEMENT_PREAMBLE, 
  AGREEMENT_SECTIONS, 
  CLIENT_DECLARATIONS, 
  IMPORTANT_NOTE 
} from '../data/travelVisaAgreementData';

const TravelVisaAgreementModal = ({ 
  isOpen, 
  onClose, 
  clientDetails = null, 
  agreementData = null, 
  onAccept = null,
  isAccepted = false
}) => {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const signedDate = agreementData?.agreedAt 
    ? new Date(agreementData.agreedAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : clientDetails?.agreedAt
    ? new Date(clientDetails.agreedAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

  const clientName = agreementData?.clientName || clientDetails?.fullName || clientDetails?.name || 'Applicant';
  const clientPassport = agreementData?.clientPassport || clientDetails?.passportNumber || '';
  const clientEmail = agreementData?.clientEmail || clientDetails?.email || '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-xl text-slate-900 leading-tight">
                {AGREEMENT_TITLE}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {AGREEMENT_SUBTITLE}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-2 rounded-xl text-slate-700 hover:text-primary hover:bg-primary/5 transition-all text-xs font-semibold flex items-center gap-1.5 border border-slate-300 bg-white shadow-sm cursor-pointer"
              title="Print or Save as PDF"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable Agreement in crisp light theme */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 font-sans text-sm leading-relaxed bg-white agreement-print-container">
          
          {/* Official Document Banner */}
          <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white mb-1.5">
                Official Document
              </div>
              <p className="font-headline font-bold text-base text-primary">
                Zoltan Visa UK • Travel & Visa Assistance Agreement
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Standard processing timeline: 35 days (+ 10-day grace period). Governing law: England and Wales.
              </p>
            </div>

            {(isAccepted || agreementData?.agreed) && (
              <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-base text-emerald-600">task_alt</span>
                Digitally Accepted
              </div>
            )}
          </div>

          {/* Electronic Acceptance Certificate if already signed */}
          {(clientName !== 'Applicant' || clientPassport) && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Applicant Name:</span>
                <span className="font-bold text-slate-900">{clientName}</span>
              </div>
              {clientPassport && (
                <div>
                  <span className="text-slate-500 block font-medium">Passport Number:</span>
                  <span className="font-bold text-slate-900">{clientPassport}</span>
                </div>
              )}
              {clientEmail && (
                <div>
                  <span className="text-slate-500 block font-medium">Registered Email:</span>
                  <span className="font-bold text-slate-900">{clientEmail}</span>
                </div>
              )}
              <div className="sm:col-span-3 text-[11px] text-slate-600 pt-2 border-t border-slate-200 flex items-center gap-1.5">
                <span className="text-slate-500">Date & Time of Digital Record:</span>
                <span className="font-semibold text-slate-900">{signedDate}</span>
              </div>
            </div>
          )}

          {/* Agreement Preamble */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed italic">
            {AGREEMENT_PREAMBLE}
          </div>

          {/* 19 Clauses */}
          <div className="space-y-6">
            {AGREEMENT_SECTIONS.map((section) => (
              <div key={section.id} className="space-y-2.5">
                <h3 className="font-headline font-bold text-base text-primary border-b border-slate-200 pb-1.5">
                  {section.title}
                </h3>
                <div className="space-y-2 text-slate-800">
                  {section.clauses.map((clause, cIdx) => (
                    <div key={cIdx} className="space-y-1">
                      <p className="leading-relaxed">
                        {clause.number !== '7.0' && (
                          <strong className="text-slate-900 font-bold mr-1.5">{clause.number}</strong>
                        )}
                        <span>{clause.text}</span>
                      </p>
                      {clause.bullets && (
                        <ul className="list-disc list-inside space-y-1 pl-4 text-slate-700">
                          {clause.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Client Declaration & Acceptance Section */}
          <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 space-y-4">
            <h3 className="font-headline font-bold text-base text-primary uppercase tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined">gavel</span>
              Client Declaration & Acceptance
            </h3>
            <p className="font-bold text-xs text-slate-900">
              By accepting this Agreement, I confirm that:
            </p>
            <ul className="space-y-2 text-xs text-slate-800">
              {CLIENT_DECLARATIONS.map((dec, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>{dec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Note */}
          <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-600 text-center border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">ZoltanVisa • Your International Travel Partner</p>
            <p>{IMPORTANT_NOTE}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            Electronic Agreement Ref: <span className="font-mono font-semibold text-slate-900">ZV-AGR-UK</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-2.5 rounded-full border border-slate-300 bg-white text-slate-800 font-semibold text-xs hover:bg-slate-100 transition-colors w-full sm:w-auto cursor-pointer shadow-sm"
            >
              Close
            </button>
            {onAccept && !isAccepted && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                type="button"
                className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                I Agree & Accept
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelVisaAgreementModal;
