import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isChecklistPage = location.pathname === '/checklist';
  const brand = 'ZoltanVisa';

  return (
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
              <p className="font-headline font-bold text-on-surface">Company</p>
              <ul className="space-y-2">
                <li>
                  <a className="text-slate-500 dark:text-slate-400 font-['Inter'] text-sm hover:text-primary dark:hover:text-primary-light underline underline-offset-4 transition-all" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="text-slate-500 dark:text-slate-400 font-['Inter'] text-sm hover:text-primary dark:hover:text-primary-light underline underline-offset-4 transition-all" href="#">
                    FAQ
                  </a>
                </li>
                <li>
                  <a className="text-slate-500 dark:text-slate-400 font-['Inter'] text-sm hover:text-primary dark:hover:text-primary-light underline underline-offset-4 transition-all" href="#">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-headline font-bold text-on-surface">Legal</p>
              <ul className="space-y-2">
                <li>
                  <a className="text-slate-500 dark:text-slate-400 font-['Inter'] text-sm hover:text-primary dark:hover:text-primary-light underline underline-offset-4 transition-all" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="text-slate-500 dark:text-slate-400 font-['Inter'] text-sm hover:text-primary dark:hover:text-primary-light underline underline-offset-4 transition-all" href="#">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a className="text-slate-500 dark:text-slate-400 font-['Inter'] text-sm hover:text-primary dark:hover:text-primary-light underline underline-offset-4 transition-all" href="#">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div className="hidden md:block space-y-4">
              <p className="font-headline font-bold text-on-surface">Social</p>
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
        
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 dark:text-slate-400 font-['Inter'] text-sm">
            © 2024 {brand}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-xs font-bold text-on-surface uppercase tracking-widest">
              Global Status: All Systems Operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
