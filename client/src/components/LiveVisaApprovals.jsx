import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { visaAPI } from '../services/api';

const DISPLAY_DURATION = 9500; // time notification stays visible (ms)
const PAUSE_DURATION = 4000;   // pause between notifications (ms)

const LiveVisaApprovals = () => {
  const navigate = useNavigate();
  const [approvalsList, setApprovalsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const approvalsRef = useRef(approvalsList);
  approvalsRef.current = approvalsList;

  // Fetch approvals dynamically from backend API
  useEffect(() => {
    const fetchLiveApprovals = async () => {
      try {
        const res = await visaAPI.getLiveApprovals();
        if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
          setApprovalsList(res.data);
        } else {
          setApprovalsList([]);
        }
      } catch (err) {
        console.warn('[LiveVisaApprovals] Could not fetch live approvals:', err);
        setApprovalsList([]);
      }
    };

    fetchLiveApprovals();

    // Periodic sync every 2 minutes
    const syncInterval = setInterval(fetchLiveApprovals, 120000);
    return () => clearInterval(syncInterval);
  }, []);

  // Cycle through approval notifications only when API data is received
  useEffect(() => {
    if (isDismissed || approvalsList.length === 0) return;

    // Subtle entrance 2.2s after data arrives
    const initialDelay = setTimeout(() => {
      showNextNotification();
    }, 2200);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timerRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, [isDismissed, approvalsList.length]);

  const showNextNotification = () => {
    if (approvalsRef.current.length === 0) return;
    setIsVisible(true);
    setProgress(100);

    const startTime = Date.now();
    const duration = DISPLAY_DURATION;

    // Update progress bar
    progressIntervalRef.current = setInterval(() => {
      if (isHovered) return; // Pause on hover

      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (elapsed >= duration) {
        clearInterval(progressIntervalRef.current);
        hideAndQueueNext();
      }
    }, 50);
  };

  const hideAndQueueNext = () => {
    setIsVisible(false);
    clearInterval(progressIntervalRef.current);

    timerRef.current = setTimeout(() => {
      const listLen = approvalsRef.current.length || 1;
      setCurrentIndex((prev) => (prev + 1) % listLen);
      showNextNotification();
    }, PAUSE_DURATION);
  };

  const handleCardClick = () => {
    const item = approvalsList[currentIndex];
    const params = new URLSearchParams({
      citizenship: 'Indian National',
      destination: item.destination
    });
    navigate(`/checklist?${params.toString()}`, {
      state: { citizenship: 'Indian National', destination: item.destination }
    });
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
    clearInterval(progressIntervalRef.current);
    clearTimeout(timerRef.current);
  };

  // Do not render anything until real data is received from API
  if (isDismissed || approvalsList.length === 0) return null;

  const current = approvalsList[currentIndex] || approvalsList[0];
  if (!current) return null;

  return (
    <div
      className={`fixed bottom-5 left-4 sm:left-6 z-40 max-w-[340px] sm:max-w-[370px] w-[calc(100vw-2rem)] sm:w-auto select-none transition-all duration-500 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="status"
      aria-live="polite"
    >
      <div 
        onClick={handleCardClick}
        className="relative overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.12)] hover:border-slate-300 p-3 sm:py-3 sm:px-3.5 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          {/* Subtle Compact Avatar with Initials & Flag */}
          <div className="relative shrink-0">
            <div className={`w-9 h-9 rounded-xl ${current.avatar_bg || 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'} flex items-center justify-center font-bold text-xs tracking-tight shadow-xs font-headline`}>
              {current.avatar_text || 'ZV'}
            </div>
            <span className="absolute -bottom-1 -right-1 text-[11px] bg-white rounded-full px-0.5 shadow-xs border border-slate-100 leading-none">
              {current.flag || '✈️'}
            </span>
          </div>

          {/* Compact Info Section */}
          <div className="flex-grow min-w-0 pr-4">
            {/* Top row: Name, City, and Time */}
            <div className="flex items-center gap-1.5 leading-tight">
              <h4 className="text-[13px] font-bold text-slate-900 truncate font-headline">
                {current.name}
              </h4>
              {current.city && (
                <span className="text-[11px] text-slate-400 truncate">({current.city})</span>
              )}
              <span className="text-[10px] text-slate-400 ml-auto shrink-0 font-medium">
                {current.time_ago || 'Just now'}
              </span>
            </div>

            {/* Bottom row: Destination & Status pill */}
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.2 rounded-md shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Visa Approved
              </span>
              <span className="text-[11.5px] text-slate-600 truncate">
                for <strong className="font-semibold text-slate-900">{current.destination}</strong>
              </span>
            </div>
          </div>

          {/* Subtle Dismiss Button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss approval notification"
            className="absolute top-2.5 right-2 text-slate-300 hover:text-slate-500 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            title="Hide"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Minimal Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500/70 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveVisaApprovals;
