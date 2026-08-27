import { useLocation, Link } from 'react-router-dom';
import WhatsAppWidget from './WhatsAppWidget';

const Footer = () => {
  const location = useLocation();
  const isChecklistPage = location.pathname === '/checklist';
  const brand = 'ZoltanVisa';

  const openWhatsAppDialog = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-whatsapp-dialog'));
  };

  return (
    <>
    <footer className="w-full rounded-t-[3rem] mt-20 bg-slate-50 dark:bg-slate-950 px-6 md:px-12 py-16">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="space-y-6 max-w-sm">
            <div className="text-xl font-black text-primary dark:text-primary-light font-headline">
              {brand}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-['Inter'] text-sm leading-relaxed">
              {isChecklistPage 
                ? 'Redefining the visa experience through trusted digital consultancy and unrivaled visa expertise.' 
                : 'The premier destination for travelers seeking seamless visa assistance, verified documentation, and expert guidance globally.'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <p className="font-headline font-bold text-white text-on-surface">Company</p>
              <ul className="space-y-2">
                <li>
                  <Link to="/about-us" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/payment-mode" className="text-slate-500  font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Payment Mode
                  </Link>
                </li>

                <li>
                  <Link to="/payment-terms" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Payment Terms
                  </Link>
                </li>

              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-headline font-bold text-white text-on-surface">Legal</p>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-use" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-statement" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Privacy Statement
                  </Link>
                </li>
                <li>
                  <Link to="/travel-visa-agreement" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Visa Assistance Agreement
                  </Link>
                </li>
              </ul>
            </div>
            <div className="hidden md:block space-y-4">
              <p className="font-headline text-white font-bold text-on-surface">Social</p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="https://www.travelzoltan.com" target="_blank" rel="noopener noreferrer" title="Travel Zoltan">
                  <span className="material-symbols-outlined text-sm">public</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="https://wa.me/919502060511" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                  <span className="material-symbols-outlined text-sm">chat</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-8">
            <button
              onClick={openWhatsAppDialog}
              className="flex items-center gap-2 text-slate-500 hover:text-green-600 dark:hover:text-green-500 transition-all cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              <span className="font-['Inter'] text-sm">WhatsApp</span>
            </button>
            <a
              href="tel:+442030261633"
              className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              <span className="font-['Inter'] text-sm">+44 20 3026 1633</span>
            </a>
            <a
              href="mailto:gb@zoltanvisa.com"
              className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-sm">email</span>
              <span className="font-['Inter'] text-sm">gb@zoltanvisa.com</span>
            </a>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 font-['Inter'] text-sm">
              © 2024 {brand}. All rights reserved.
            </p>
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-xs text-white font-bold uppercase tracking-widest">
              Global Status: All Systems Operational
            </p>
          </div>
        </div>
        </div>
      </div>
    </footer>

    {/* Interactive Animated WhatsApp Widget */}
    <WhatsAppWidget />
  </>
  );
};

export default Footer;

