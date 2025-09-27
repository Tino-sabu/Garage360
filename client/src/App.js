import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Services from './pages/Services';
import Vehicles from './pages/Vehicles';
import Profile from './pages/Profile';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import Navbar from './components/Navbar';

// Component to conditionally show Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const noNavbarRoutes = ['/', '/login', '/register', '/customer-dashboard', '/mechanic-dashboard', '/manager-dashboard'];
  
  if (noNavbarRoutes.includes(location.pathname)) {
    return null;
  }
  
  return <Navbar />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-gradient">
        <ConditionalNavbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<RoleBasedDashboard />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;