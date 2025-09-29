import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CustomerManagement from './pages/CustomerManagement';
import MechanicManagement from './pages/MechanicManagement';
import PartsManagement from './pages/PartsManagement';
import Services from './pages/Services';
import Vehicles from './pages/Vehicles';
import CarTypes from './pages/CarTypes';
import Profile from './pages/Profile';
import AddVehicle from './pages/AddVehicle';
import MyVehicles from './pages/MyVehicles';
import BookService from './pages/BookService';
import AssignRequests from './pages/AssignRequests';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import Navbar from './components/Navbar';

// Component to conditionally show Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const noNavbarRoutes = [
    '/',
    '/login',
    '/register',
    '/customer-dashboard',
    '/mechanic-dashboard',
    '/manager-dashboard',
    '/customer-management',
    '/mechanic-management',
    '/parts-management',
    '/add-vehicle',
    '/my-vehicles',
    '/book-service',
    '/assign-requests'
  ];

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
          <Route path="/customer-management" element={<CustomerManagement />} />
          <Route path="/mechanic-management" element={<MechanicManagement />} />
          <Route path="/parts-management" element={<PartsManagement />} />
          <Route path="/services" element={<Services />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/car-types" element={<CarTypes />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/my-vehicles" element={<MyVehicles />} />
          <Route path="/book-service" element={<BookService />} />
          <Route path="/assign-requests" element={<AssignRequests />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;