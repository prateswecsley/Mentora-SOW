import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './supabaseClient';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import SavedReports from './pages/SavedReports';
import ReportView from './pages/ReportView';
import Profile from './pages/Profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0]
        });
        setIsAuthenticated(true);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0]
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ?
                <Navigate to="/dashboard" replace /> :
                <Login />
            }
          />

          <Route
            path="/dashboard"
            element={
              isAuthenticated ?
                <Dashboard user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/new-report"
            element={
              isAuthenticated ?
                <NewReport user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/saved-reports"
            element={
              isAuthenticated ?
                <SavedReports user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/report/:id"
            element={
              isAuthenticated ?
                <ReportView user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/profile"
            element={
              isAuthenticated ?
                <Profile user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
