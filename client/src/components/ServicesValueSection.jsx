import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ServicesValueSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const handleOpenRefusalChat = () => {
    window.dispatchEvent(
      new CustomEvent('open-whatsapp-dialog', {
        detail: {
          presetText: 'Hi Zoltan Team! I have a visa refusal/rejection case and would like a specialized consultation to reapply successfully.'
        }
      })
    );
  };

  const handleScrollToSelector = () => {
    const selectorEl = document.getElementById('selector-box');
    if (selectorEl) {
      selectorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      navigate('/');
    }
  };

  const deliverables = [
    {
      icon: 'flight_takeoff',
      badge: 'Zero Financial Risk',
      title: 'Provisional Flight Reservations',
      desc: 'Genuine, verifiable flight itineraries with active PNRs accepted by all embassies worldwide — without purchasing risky non-refundable tickets upfront.',
      tag: 'Flights & Routing'
    },
    {
      icon: 'hotel',
      badge: '100% Compliant',
      title: 'Confirmed Hotel Vouchers',
      desc: 'Official embassy-approved accommodation bookings matching your travel dates and itinerary perfectly, fully verified with zero cancellation stress.',
      tag: 'Accommodations'
    },
    {
      icon: 'health_and_safety',
      badge: '€30,000+ Schengen Cover',
      title: 'International Travel Insurance',
      desc: 'Comprehensive, zero-deductible travel medical insurance certificates meeting strict Schengen, US, UK, and worldwide consular health mandates.',
      tag: 'Insurance'
    },
    {
      icon: 'map',
      badge: 'Day-by-Day Precision',
      title: 'Tailored Travel Itinerary',
      desc: 'Custom, realistic daily itineraries crafted by destination specialists detailing sights, intra-city travel, and timings that satisfy visa officers.',
      tag: 'Itinerary'
    },
    {
      icon: 'history_edu',
      badge: 'Legal-Grade Drafting',
      title: 'SOP & Purpose of Travel Letters',
      desc: 'Persuasive, bespoke cover letters and Statements of Purpose drafted by senior visa consultants establishing undeniable home ties & travel intent.',
      tag: 'Cover Letters'
    },
    {
      icon: 'badge',
      badge: 'Custom Employer NOCs',
      title: 'Sponsor & Leave Documents',
      desc: 'Pre-formatted, legally vetted employer leave sanction letters, sponsorship undertakings, and family invitation templates tailored to your exact case.',
      tag: 'Sponsorship'
    },
    {
      icon: 'account_balance',
      badge: 'Audit & Structuring',
      title: 'Financial Document Review',
      desc: 'Expert audit of your bank statements, payslips, and tax documents to ensure your financial profile meets stringent consular solvency benchmarks.',
      tag: 'Financials'
    },
    {
      icon: 'event_available',
      badge: 'Fast-Track Booking',
      title: 'Priority Appointment & Biometrics',
      desc: 'Assistance with securing high-demand appointment slots at VFS Global, TLScontact, BLS, and consulates, plus mock interview coaching.',
      tag: 'Appointments'
    }
  ];

  const comparisonRows = [
    {
      category: 'Applicant Effort',
      others: 'You spend 20+ hours chasing flights, hotel vouchers, insurance, drafting letters, and stress over formatting errors.',
      zoltan: '5 minutes! Just provide your basic details & passport. We handle 100% of the document generation and dossier compilation.'
    },
    {
      category: 'Financial Risk',
      others: 'Forces you to risk £1,000s purchasing non-refundable flights and hotels before your visa is even decided.',
      zoltan: 'Zero financial risk. We supply valid provisional airline PNRs and confirmed hotel vouchers fully recognized by embassies.'
    },
    {
      category: 'Cover Letter & SOP',
      others: 'Generic copy-paste templates or blank boxes that consular officers immediately flag and reject.',
      zoltan: 'Bespoke legal-grade Purpose of Travel letter drafted by senior visa specialists highlighting your ties to home country.'
    },
    {
      category: 'Travel Insurance',
      others: 'You must buy separately with no guarantee it meets the €30,000+ Schengen or international embassy compliance.',
      zoltan: 'Directly included: Official zero-deductible travel medical insurance policy with immediate certificate issuance.'
    },
    {
      category: 'Day-to-Day Itinerary',
      others: 'Basic bullet points or generic templates that trigger consular doubt regarding genuine tourist intent.',
      zoltan: 'Detailed day-by-day travel plan with real routes, attractions, and logical stay durations tailored to your profile.'
    },
    {
      category: 'Previously Rejected Cases',
      others: '❌ Decline or ignore refused applicants. Offer standard automated processing only.',
      zoltan: '🌟 Specialized Refusal Recovery Team. Forensic refusal analysis, targeted rebuttal letters, and fortified appeal dossiers.'
    },
    {
      category: 'Support & Guidance',
      others: 'Automated chatbots, impersonal helpdesks, and delayed email responses.',
      zoltan: 'Dedicated 1-on-1 Senior Visa Consultant available via WhatsApp & direct phone from application to approval.'
    }
  ];

  const filteredComparison = comparisonRows.filter(row => {
    if (activeTab === 'all') return true;
    if (activeTab === 'docs' && ['Applicant Effort', 'Cover Letter & SOP', 'Day-to-Day Itinerary', 'Travel Insurance'].includes(row.category)) return true;
    if (activeTab === 'risk' && ['Financial Risk', 'Support & Guidance'].includes(row.category)) return true;
    if (activeTab === 'refusal' && ['Previously Rejected Cases', 'Cover Letter & SOP', 'Financial Risk'].includes(row.category)) return true;
    return true;
  });

  return (
    <section id="services" className="py-24 px-6 md:px-12 bg-gradient-to-b from-surface-container-low via-surface to-surface-container-low relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-surface-tint/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-screen-2xl mx-auto space-y-24">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER: The Core Value Proposition */}
        {/* ========================================================================= */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-headline font-bold text-xs md:text-sm tracking-wide shadow-sm">
            <span className="material-symbols-outlined text-base">verified_user</span>
            ALL-INCLUSIVE WHITE-GLOVE VISA CONCIERGE
          </div>
          
          <h2 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.15]">
            You Provide Basic Details. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary-container bg-clip-text text-transparent">
              We Handle 100% of Everything Else.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-3xl mx-auto">
            Unlike generic visa sites where you are left alone to book risky flights, find compliant hotels, and draft legal letters — Zoltan Visa provides an end-to-end embassy-ready dossier so you can apply with total confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-xs font-semibold text-on-surface border border-slate-200/80 shadow-xs">
              <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> No upfront flight purchase
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-xs font-semibold text-on-surface border border-slate-200/80 shadow-xs">
              <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> Hotel vouchers included
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-xs font-semibold text-on-surface border border-slate-200/80 shadow-xs">
              <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> Custom cover letters & SOP
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-xs font-semibold text-on-surface border border-slate-200/80 shadow-xs">
              <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> Refusal cases overturned
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DELIVERABLES GRID: 8 Core Pillars */}
        {/* ========================================================================= */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/60 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Comprehensive Coverage</span>
              <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface mt-1">
                Everything We Provide With Your Application
              </h3>
            </div>
            <p className="text-sm md:text-base text-on-surface-variant max-w-md">
              Every document is verified against the latest consular guidelines for maximum approval probability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deliverables.map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-surface-container-lowest p-7 rounded-2xl border border-slate-200/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="w-13 h-13 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {item.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1">
                    {item.tag}
                  </span>
                  <h4 className="font-headline text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>100% Embassy Ready</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SPECIALIZED SECTION: "REJECTED CASES MOST WELCOME" (HIGH-CONVERSION) */}
        {/* ========================================================================= */}
        <div id="refusal-specialist" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl border border-slate-700/60 p-8 md:p-14 scroll-mt-28">
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading & Pitch */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-headline font-bold text-xs md:text-sm tracking-wide">
                <span className="material-symbols-outlined text-base text-rose-400">gavel</span>
                SPECIALIZED VISA CONSULTANTS • REFUSAL CASES MOST WELCOME
              </div>

              <h3 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Previously Refused or Rejected? <br />
                <span className="text-rose-400">We Turn Denials Into Approvals.</span>
              </h3>

              <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Most visa portals decline applicants with previous refusals. We do the exact opposite: <strong className="text-white">we specialize in complex, hard, and previously rejected cases</strong> across Schengen, UK, USA (214b), Canada, and Australia.
              </p>

              {/* Forensic 4-Step Strategy Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">1</span>
                    <h5 className="font-headline font-bold text-sm text-white">Refusal Letter Forensic Audit</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We analyze specific consular refusal clauses, immigration rules, and officer notes.
                  </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">2</span>
                    <h5 className="font-headline font-bold text-sm text-white">Targeted Gap Remediation</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We resolve financial ambiguities, strengthen home ties, and clarify trip purpose.
                  </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">3</span>
                    <h5 className="font-headline font-bold text-sm text-white">Legal-Grade Rebuttal Letter</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A point-by-point factual appeal letter countering each previous refusal ground.
                  </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">4</span>
                    <h5 className="font-headline font-bold text-sm text-white">Fortified Supporting Dossier</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rock-solid provisional bookings, employer endorsements, and bank justifications.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleOpenRefusalChat}
                  className="bg-gradient-to-r from-rose-600 via-primary to-primary-container hover:from-rose-500 hover:to-primary text-white font-headline font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-rose-600/30 transition-all flex items-center justify-center gap-3 active:scale-98 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">chat</span>
                  Get Free Refusal Evaluation
                </button>

                <button
                  onClick={handleScrollToSelector}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-headline font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Apply for New Visa
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Right Column: High-Trust Metric Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Track Record</p>
                    <h4 className="font-headline text-lg font-bold text-white">Refusal Case Statistics</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    Live Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <p className="text-3xl font-extrabold text-emerald-400 font-headline">92.4%</p>
                    <p className="text-xs text-slate-400 mt-1">Refusal Overturn Success Rate</p>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <p className="text-3xl font-extrabold text-primary font-headline">3,500+</p>
                    <p className="text-xs text-slate-400 mt-1">Previously Refused Visas Granted</p>
                  </div>
                </div>

                {/* Refusal Testimonial Snippet */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Schengen Visa Refusal Overturned</span>
                  </div>
                  <p className="text-xs italic text-slate-300 leading-relaxed">
                    "I had two consecutive French visa rejections for 'lack of justification for stay'. Zoltan drafted a comprehensive legal justification letter and structured my itinerary. Approved in 8 days!"
                  </p>
                  <p className="text-[11px] font-bold text-slate-400">— Tariq M. (London, UK)</p>
                </div>

                <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-rose-400 text-base">shield</span>
                  <span>Confidential 1-on-1 assessment of your refusal notice.</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SIDE-BY-SIDE COMPARISON TABLE ("Others vs Zoltan") */}
        {/* ========================================================================= */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Unmatched Value</span>
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">
              Why Travelers Choose Zoltan Over Traditional Visa Sites
            </h3>
            <p className="text-on-surface-variant text-base">
              See how our all-inclusive concierge compares to generic booking engines and standard agents.
            </p>

            {/* Filter Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container-high border border-slate-200/60 max-w-full overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Features
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'docs'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Documents & Letters
              </button>
              <button
                onClick={() => setActiveTab('risk')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'risk'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Risk & Support
              </button>
              <button
                onClick={() => setActiveTab('refusal')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'refusal'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Refusal Handling
              </button>
            </div>
          </div>

          {/* Comparison Matrix Cards */}
          <div className="bg-surface-container-lowest rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-50 border-b border-slate-200 p-6 gap-4 font-headline font-bold text-sm">
              <div className="md:col-span-3 text-slate-500 uppercase tracking-wider text-xs flex items-center">
                Comparison Factor
              </div>
              <div className="md:col-span-4 text-slate-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                Other Visa Websites & DIY
              </div>
              <div className="md:col-span-5 text-primary flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                Zoltan Visa VIP Experience
              </div>
            </div>

            {/* Matrix Body Rows */}
            <div className="divide-y divide-slate-100">
              {filteredComparison.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4 hover:bg-slate-50/70 transition-colors items-center"
                >
                  <div className="md:col-span-3 font-headline font-bold text-on-surface text-base">
                    {row.category}
                  </div>
                  
                  {/* Other Websites Column */}
                  <div className="md:col-span-4 flex items-start gap-3 text-sm text-slate-600 bg-red-50/40 md:bg-transparent p-3 md:p-0 rounded-xl">
                    <span className="material-symbols-outlined text-red-500 text-lg shrink-0 mt-0.5">
                      cancel
                    </span>
                    <span>{row.others}</span>
                  </div>

                  {/* Zoltan Visa Column */}
                  <div className="md:col-span-5 flex items-start gap-3 text-sm text-on-surface font-medium bg-emerald-50/50 md:bg-transparent p-3 md:p-0 rounded-xl border border-emerald-100 md:border-none">
                    <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>
                      check_circle
                    </span>
                    <span>{row.zoltan}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Callout in Comparison */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary-container/10 p-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-headline font-bold text-xl text-on-surface">
                  Ready to Experience the Zoltan Difference?
                </h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  Start your stress-free visa journey today with expert verification.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleScrollToSelector}
                  className="bg-primary hover:bg-primary/90 text-white font-headline font-bold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Check Your Visa Requirements
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4-STEP HOW IT WORKS (SIMPLE & FAST) */}
        {/* ========================================================================= */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Simple 4-Step Journey</span>
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-1">
              From Application to Passport Stamped
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Select Destination',
                desc: 'Pick your citizenship and travel destination above to see instant requirements and fees.'
              },
              {
                step: '02',
                title: 'Submit Basic Info',
                desc: 'Upload your passport copy and answer a few quick questions. No paperwork hassle.'
              },
              {
                step: '03',
                title: 'We Build Your Dossier',
                desc: 'Our team generates provisional flights, hotels, insurance, day-by-day itinerary & cover letters.'
              },
              {
                step: '04',
                title: 'Appointment & Visa',
                desc: 'Attend your booked biometric slot with our finalized embassy package and receive your visa!'
              }
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest p-6 rounded-2xl border border-slate-200/80 relative shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-headline font-extrabold text-sm flex items-center justify-center mb-4">
                  {step.step}
                </div>
                <h4 className="font-headline font-bold text-lg text-on-surface mb-2">
                  {step.title}
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesValueSection;
