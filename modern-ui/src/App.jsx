import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout } from 'lucide-react'; // Placeholder for icon, actual Layout component below
import { AnimatePresence, motion } from 'framer-motion';

// Pages
import ItineraryBuilder from './components/Itinerary/ItineraryBuilder';
import TripCalendar from './components/Calendar/TripCalendar';
import BudgetDashboard from './components/Budget/BudgetDashboard';
import { TripProvider } from './context/TripContext';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        padding: '0.75rem 1.5rem',
        borderRadius: '9999px',
        textDecoration: 'none',
        color: isActive ? '#fff' : 'var(--text-muted)',
        background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
        transition: 'all 0.3s ease',
        fontWeight: 500
      }}
    >
      {children}
    </Link>
  );
}

function NavBar() {
  return (
    <nav className="glass" style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '1rem',
      padding: '0.5rem',
      borderRadius: '9999px',
      zIndex: 50
    }}>
      <NavLink to="/">Itinerary</NavLink>
      <NavLink to="/calendar">Calendar</NavLink>
      <NavLink to="/budget">Budget</NavLink>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <ItineraryBuilder />
            </motion.div>
          }
        />
        <Route
          path="/calendar"
          element={
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <TripCalendar />
            </motion.div>
          }
        />
        <Route
          path="/budget"
          element={
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <BudgetDashboard />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <TripProvider>
        <div style={{ paddingBottom: '100px', minHeight: '100vh' }}>
          <header style={{ padding: '2rem', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2.5rem',
              background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GlobeTrotter
            </h1>
          </header>
          <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimatedRoutes />
          </main>
          <NavBar />
        </div>
      </TripProvider>
    </Router>
  );
}

export default App;
