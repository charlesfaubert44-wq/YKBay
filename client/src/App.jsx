import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import UploadTrack from './pages/UploadTrack';
import Login from './pages/Login';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppProvider } from './contexts/AppContext';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-midnight-dark via-midnight-blue to-midnight-dark">
                <Navigation />
                <Routes>
                  <Route path="/" element={<MapView />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upload" element={<UploadTrack />} />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </div>
            </Router>
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
