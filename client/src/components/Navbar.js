import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiTruck, FiTool, FiUser, FiLogOut, FiClipboard, FiDollarSign } from 'react-icons/fi';

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
    setIsOpen(false);
    navigate('/');
  };

  // Get nav items based on user role
  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: FiHome },
      { name: 'Vehicles', path: '/car-types', icon: FiTruck },
    ];

    // Add role-specific items
    if (user?.role === 'manager') {
      baseItems.push(
        { name: 'Requests', path: '/assign-requests', icon: FiClipboard },
        { name: 'Payments', path: '/salary-payments', icon: FiDollarSign }
      );
    } else if (user?.role === 'mechanic') {
      baseItems.push({ name: 'Jobs', path: '/mechanic-jobs', icon: FiTool });
    } else {
      baseItems.push({ name: 'Services', path: '/services', icon: FiTool });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-dark-800/95 backdrop-blur-lg border-b border-dark-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Mobile menu button - TOP LEFT */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>

          {/* Logo - Centered on mobile, left on desktop */}
          <div className="flex items-center absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg">
                <FiTool className="text-white text-lg sm:text-xl" />
              </div>
              <span className="text-xl sm:text-2xl font-bold hidden xs:block">
                <span className="text-white">G</span>
                <span className="text-yellow-400">A</span>
                <span className="text-white">R</span>
                <span className="text-blue-400">A</span>
                <span className="text-white">G</span>
                <span className="text-yellow-400">E</span>
                <span className="text-red-500">360</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(item.path)
                  ? 'text-white bg-dark-700 shadow-lg'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                  }`}
              >
                <item.icon className="text-lg" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* User Actions */}
            <div className="flex items-center space-x-3 lg:space-x-4 ml-4 lg:ml-8 pl-4 lg:pl-8 border-l border-dark-700">
              {isAuthenticated && user ? (
                <>
                  {/* User Info - Hidden on small desktop */}
                  <div className="text-right hidden lg:block">
                    <p className="text-white font-medium text-sm">{user.name}</p>
                    <p className="text-dark-300 text-xs">{getRoleDescription(user.role)}</p>
                  </div>

                  {/* User Avatar */}
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-dark-700">
                    <FiUser className="text-white text-sm lg:text-base" />
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all"
                    title="Logout"
                  >
                    <FiLogOut className="text-lg" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-dark-300 hover:text-white font-medium transition-colors px-3 py-2 rounded-lg hover:bg-dark-700/50"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm py-2"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile User Avatar (right side) */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && user && (
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-dark-700">
                <FiUser className="text-white text-sm" />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Slide-out Navigation Menu */}
        <div
          className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
            isOpen ? 'visible' : 'invisible'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-out Menu */}
          <div
            className={`absolute top-0 left-0 h-full w-72 sm:w-80 bg-dark-800 border-r border-dark-700 shadow-2xl transform transition-transform duration-300 ease-out ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg">
                  <FiTool className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-white">GARAGE</span>
                  <span className="text-red-500">360</span>
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-all"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            {/* User Info Section */}
            {isAuthenticated && user && (
              <div className="p-4 bg-dark-700/50 border-b border-dark-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-primary-400/30">
                    <FiUser className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{user.name}</p>
                    <p className="text-dark-300 text-sm">{getRoleDescription(user.role)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white bg-primary-500 shadow-lg scale-105'
                      : 'text-dark-300 hover:text-white hover:bg-dark-700 hover:scale-105'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="text-xl" />
                  <span className="text-base">{item.name}</span>
                </Link>
              ))}

              {/* Auth Actions */}
              <div className="pt-4 mt-4 border-t border-dark-700 space-y-2">
                {isAuthenticated && user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-4 px-4 py-3 w-full rounded-lg text-dark-300 hover:text-red-400 hover:bg-dark-700 font-medium transition-all"
                  >
                    <FiLogOut className="text-xl" />
                    <span className="text-base">Logout</span>
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-3 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 font-medium transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-4 py-3 btn-primary text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;