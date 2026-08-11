import React, { useState, useEffect, useRef } from 'react';

const WHATSAPP_NUMBER = '919502060511';

const QUICK_PROMPTS = [
  { label: '✈️ New Visa Application', text: 'Hi! I would like to apply for a new visa.' },
  { label: '📄 Required Documents', text: 'Hi! What documents do I need for my visa application?' },
  { label: '🔍 Track Application', text: 'Hi! I want to check the status of my visa application.' },
  { label: '💰 Fees & Timeline', text: 'Hi! Can you tell me about the visa processing fees and timelines?' },
];

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle opening WhatsApp widget globally via custom event
  useEffect(() => {
    const handleGlobalOpen = (e) => {
      setIsOpen(true);
      setHasUnread(false);
      if (e?.detail?.presetText) {
        setUserMessage(e.detail.presetText);
      }
    };

    window.addEventListener('open-whatsapp-dialog', handleGlobalOpen);
    return () => window.removeEventListener('open-whatsapp-dialog', handleGlobalOpen);
  }, []);

  // When dialog opens, trigger typing animation effect
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      if (chatHistory.length === 0) {
        setIsTyping(true);
        const timer1 = setTimeout(() => {
          setIsTyping(false);
          setShowGreeting(true);
          setChatHistory([
            {
              id: 1,
              sender: 'agent',
              text: '👋 Hello! Welcome to ZoltanVisa Support.',
              time: getCurrentTime(),
            },
            {
              id: 2,
              sender: 'agent',
              text: 'How can our visa experts assist your travel plans today?',
              time: getCurrentTime(),
            },
          ]);
        }, 700);

        return () => clearTimeout(timer1);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || userMessage;
    if (!text.trim()) return;

    // Add user message to UI chat history
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: getCurrentTime(),
    };

    setChatHistory((prev) => [...prev, newMsg]);
    setUserMessage('');

    // Open WhatsApp after brief delay to show message animation
    setTimeout(() => {
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text.trim())}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  const handleQuickPromptClick = (prompt) => {
    handleSendMessage(prompt.text);
  };

  return (
    <>
      {/* Animated Floating WhatsApp Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center group">
        {/* Tooltip on hover */}
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Chat with Visa Expert
          </div>
        )}

        <button
          onClick={handleToggle}
          aria-label={isOpen ? 'Close WhatsApp Chat' : 'Open WhatsApp Chat'}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-xl hover:shadow-2xl hover:shadow-green-500/30 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400/40 cursor-pointer"
        >
          {/* Continuous Pulsing Wave / Ripple rings */}
          {!isOpen && (
            <>
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-whatsapp-ripple pointer-events-none"></span>
              <span className="absolute -inset-1 rounded-full bg-emerald-400/30 blur-md animate-pulse pointer-events-none"></span>
            </>
          )}

          {/* Unread notification badge */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-extrabold text-white items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                1
              </span>
            </span>
          )}

          {/* Animated Icon Transition (WhatsApp Logo <-> Close X Icon) */}
          <div className={`transition-transform duration-500 transform ${isOpen ? 'rotate-180 scale-110' : 'animate-whatsapp-wiggle'}`}>
            {isOpen ? (
              <svg className="w-7 h-7 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8 sm:w-9 sm:h-9 fill-current drop-shadow-md" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Animated WhatsApp Chat Dialog Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-3xl bg-slate-900 text-slate-100 shadow-2xl border border-slate-700/60 overflow-hidden animate-dialog-appear flex flex-col font-['Inter'] transition-all">
          {/* WhatsApp Dialog Header */}
          <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {/* Agent Avatar with Animated Status */}
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md p-0.5 border border-white/40 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-base shadow-inner">
                    ZV
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-emerald-900 shadow-sm animate-pulse"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base tracking-wide font-headline leading-tight">ZoltanVisa Support</h3>
                  <span className="material-symbols-outlined text-emerald-300 text-sm">verified</span>
                </div>
                <p className="text-xs text-emerald-100/90 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                  Replies in seconds • Online 24/7
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggle}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors focus:outline-none cursor-pointer"
                title="Close chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* WhatsApp Chat Body Container */}
          <div className="relative h-80 overflow-y-auto p-4 space-y-3.5 bg-slate-950/90 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Timestamp Badge */}
            <div className="text-center my-1">
              <span className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 text-[11px] text-slate-400 rounded-full font-medium shadow-sm">
                Today
              </span>
            </div>

            {/* Agent Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 animate-message-pop max-w-[80%]">
                <div className="bg-slate-800 text-slate-200 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-typing-dot-1"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-typing-dot-2"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-typing-dot-3"></span>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-message-pop`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700/70 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                      msg.sender === 'user' ? 'text-emerald-100/80' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {msg.sender === 'user' && (
                      <span className="material-symbols-outlined text-xs">done_all</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Prompts Chip Carousel */}
            {showGreeting && (
              <div className="pt-2 animate-message-pop space-y-2">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-1">
                  Suggested topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPromptClick(prompt)}
                      className="px-3 py-1.5 text-xs bg-slate-800/90 hover:bg-emerald-950 hover:border-emerald-500/60 text-emerald-300 hover:text-emerald-200 border border-slate-700/60 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 text-left shadow-sm cursor-pointer"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer / Input Form */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-grow bg-slate-800 text-slate-100 placeholder-slate-400 text-sm px-4 py-2.5 rounded-full border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!userMessage.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Send to WhatsApp"
            >
              <svg className="w-5 h-5 fill-current transform translate-x-0.5" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWidget;
