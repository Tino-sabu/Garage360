import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiTruck, FiTool, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const getRoleDescription = (role) => {
    switch (role) {
      case 'customer': return 'Customer';
      case 'mechanic': return 'Mechanic';
      case 'manager': return 'Manager';
      default: return 'User';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Vehicles', path: '/vehicles', icon: FiTruck },
    { name: 'Services', path: '/services', icon: FiTool },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-dark-800/95 backdrop-blur-lg border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <FiTool className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold gradient-text">Garage360</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-white bg-dark-700 shadow-lg'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <item.icon className="text-lg" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* User Actions */}
            <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-dark-700">
              {isAuthenticated && user ? (
                <>
                  {/* User Info */}
                  <div className="text-right">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-dark-300 text-sm">{getRoleDescription(user.role)}</p>
                  </div>
                  
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <FiUser className="text-white" />
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="text-lg" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-dark-300 hover:text-white font-medium transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-dark-300 hover:text-white focus:outline-none focus:text-white transition-colors"
            >
              {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-800/95 backdrop-blur-lg rounded-lg mt-2 border border-dark-700">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white bg-dark-700'
                      : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="text-lg" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-dark-700 mt-4">
                {isAuthenticated && user ? (
                  <>
                    {/* Mobile User Info */}
                    <div className="px-3 py-2 mb-3">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-dark-300 text-sm">{getRoleDescription(user.role)}</p>
                    </div>
                    
                    {/* Mobile Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-2 w-full text-left text-dark-300 hover:text-white font-medium transition-colors"
                    >
                      <FiLogOut className="text-lg" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-dark-300 hover:text-white font-medium transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="block mt-2 px-3 py-2 btn-primary text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;