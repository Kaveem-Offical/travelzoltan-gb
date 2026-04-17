import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TopNavBar from './components/TopNavBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChecklistPage from './pages/ChecklistPage';
import AdminPage from './pages/AdminPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { pathname } = useLocation();
  const isAdminPage = pathname === '/admin';

  return (
    <div className={`min-h-screen flex ${isAdminPage ? '' : 'flex-col'}`}>
      {!isAdminPage && <TopNavBar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
