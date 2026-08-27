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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-xl text-on-surface leading-tight">
                {AGREEMENT_TITLE}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {AGREEMENT_SUBTITLE}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all text-xs font-semibold flex items-center gap-1.5 border border-outline-variant/30"
              title="Print or Save as PDF"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable Agreement */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-8 text-on-surface font-sans text-sm leading-relaxed agreement-print-container">
          
          {/* Official Document Banner */}
          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white mb-1.5">
                Official Document
              </div>
              <p className="font-headline font-bold text-base text-primary">
                Zoltan Visa UK • Travel & Visa Assistance Agreement
              </p>
              <p className="text-xs text-on-surface-variant">
                Standard processing timeline: 35 days (+ 10-day grace period). Governing law: England and Wales.
              </p>
            </div>

            {(isAccepted || agreementData?.agreed) && (
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                <span className="material-symbols-outlined text-base">task_alt</span>
                Digitally Accepted
              </div>
            )}
          </div>

          {/* Electronic Acceptance Certificate if already signed */}
          {(clientName !== 'Applicant' || clientPassport) && (
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-on-surface-variant block font-medium">Applicant Name:</span>
                <span className="font-semibold text-on-surface">{clientName}</span>
              </div>
              {clientPassport && (
                <div>
                  <span className="text-on-surface-variant block font-medium">Passport Number:</span>
                  <span className="font-semibold text-on-surface">{clientPassport}</span>
                </div>
              )}
              {clientEmail && (
                <div>
                  <span className="text-on-surface-variant block font-medium">Registered Email:</span>
                  <span className="font-semibold text-on-surface">{clientEmail}</span>
                </div>
              )}
              <div className="sm:col-span-3 text-[11px] text-on-surface-variant/80 pt-1 border-t border-outline-variant/20">
                <span>Date & Time of Digital Record: </span>
                <span className="font-medium text-on-surface">{signedDate}</span>
              </div>
            </div>
          )}

          {/* Agreement Preamble */}
          <div className="bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 text-on-surface/90 italic">
            {AGREEMENT_PREAMBLE}
          </div>

          {/* 19 Clauses */}
          <div className="space-y-6">
            {AGREEMENT_SECTIONS.map((section) => (
              <div key={section.id} className="space-y-3">
                <h3 className="font-headline font-bold text-base text-on-surface text-primary/95 border-b border-outline-variant/20 pb-1">
                  {section.title}
                </h3>
                <div className="space-y-2 text-on-surface/85">
                  {section.clauses.map((clause, cIdx) => (
                    <div key={cIdx} className="space-y-1.5">
                      <p className="font-medium">
                        <span className="font-bold text-on-surface mr-1.5">{clause.number !== '7.0' ? clause.number : ''}</span>
                        {clause.text}
                      </p>
                      {clause.bullets && (
                        <ul className="list-disc list-inside space-y-1 pl-4 text-on-surface-variant/90">
                          {clause.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-snug">
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
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
            <h3 className="font-headline font-bold text-base text-primary uppercase tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined">gavel</span>
              Client Declaration & Acceptance
            </h3>
            <p className="font-semibold text-xs text-on-surface">
              By accepting this Agreement, I confirm that:
            </p>
            <ul className="space-y-2 text-xs text-on-surface/90">
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
          <div className="p-4 rounded-xl bg-surface-container-lowest text-xs text-on-surface-variant text-center border border-outline-variant/30">
            <p className="font-semibold text-on-surface mb-1">ZoltanVisa • Your International Travel Partner</p>
            <p>{IMPORTANT_NOTE}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-outline-variant/20 bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-on-surface-variant">
            Electronic Agreement Ref: <span className="font-mono font-medium">ZV-AGR-UK</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-2.5 rounded-full border border-outline-variant text-on-surface font-semibold text-xs hover:bg-surface-container-low transition-colors w-full sm:w-auto"
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
                className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
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
