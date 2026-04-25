import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const TopNavBar = () => {
  const location = useLocation();
  const isChecklistPage = location.pathname === '/checklist';
  const isAboutPage = location.pathname === '/about-us';
  const isContactPage = location.pathname === '/contact-us';
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80  backdrop-blur-md shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="text-2xl font-black text-primary dark:text-primary-light tracking-tighter font-headline">
          <img src={ logo } alt="ZoltanVisa" className="h-12" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`font-headline font-semibold tracking-tight transition-colors ${
              location.pathname === '/' 
                ? 'text-primary dark:text-primary-light border-b-2 border-primary' 
                : 'text-slate-600  hover:text-primary dark:hover:text-primary-light'
            }`}
          >
            Home
          </Link>
          {/* <a className="font-headline font-semibold tracking-tight text-slate-600  hover:text-primary dark:hover:text-primary-light transition-colors" href="#destinations">
            Destinations
          </a>
          <a className="font-headline font-semibold tracking-tight text-slate-600  hover:text-primary dark:hover:text-primary-light transition-colors" href="#services">
            Services
          </a> */}
          <Link 
            to="/about-us" 
            className={`font-headline font-semibold tracking-tight transition-colors ${
              isAboutPage 
                ? 'text-primary dark:text-primary-light border-b-2 border-primary' 
                : 'text-slate-600 hover:text-primary dark:hover:text-primary-light'
            }`}
          >
            About Us
          </Link>
          <Link 
            to="/contact-us" 
            className={`font-headline font-semibold tracking-tight transition-colors ${
              isContactPage 
                ? 'text-primary dark:text-primary-light border-b-2 border-primary' 
                : 'text-slate-600 hover:text-primary dark:hover:text-primary-light'
            }`}
          >
            Contact Us
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#selector-box" className="bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-semibold tracking-tight px-6 py-2.5 rounded-full hover:shadow-lg transition-all active:scale-95">
            Take Action
          </a>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
