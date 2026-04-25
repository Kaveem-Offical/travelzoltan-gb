import { useLocation, Link } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isChecklistPage = location.pathname === '/checklist';
  const brand = 'ZoltanVisa';

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
                ? 'Redefining the travel experience through premium digital curatorship and unrivaled visa expertise.' 
                : 'The premier destination for discerning travelers seeking seamless visa assistance and luxury travel curation globally.'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <p className="font-headline font-bold text-white text-on-surface">Company</p>
              <ul className="space-y-2">
                <li>
                  <Link to="/payment-mode" className="text-slate-500  font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Payment Mode
                  </Link>
                </li>
                <li>
                  <Link to="/cancellation-refund" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Cancellation & Refund
                  </Link>
                </li>
                <li>
                  <Link to="/payment-terms" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Payment Terms
                  </Link>
                </li>
                <li>
                  <Link to="/reservations-bookings" className="text-slate-500 font-['Inter'] text-sm hover:text-primary underline underline-offset-4 transition-all">
                    Reservations & Bookings
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
              </ul>
            </div>
            <div className="hidden md:block space-y-4">
              <p className="font-headline text-white font-bold text-on-surface">Social</p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-sm">public</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-sm">share</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-8">
            <a
              href="https://wa.me/919502060511"
              className="flex items-center gap-2 text-slate-500 hover:text-green-600 dark:hover:text-green-500 transition-all"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              <span className="font-['Inter'] text-sm">WhatsApp</span>
            </a>
            <a
              href="tel://00442081911814"
              className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              <span className="font-['Inter'] text-sm">+44 20 8191 1814</span>
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

    {/* WhatsApp Floating Action Button */}
    <a
      href="https://wa.me/919502060511"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  </>
  );
};

export default Footer;
