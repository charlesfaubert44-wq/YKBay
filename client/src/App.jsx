import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import UploadTrack from './pages/UploadTrack';
import Login from './pages/Login';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-midnight-blue">
        <Navigation />
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadTrack />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
