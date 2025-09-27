import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(/pic1.jpg)`,
            }}
          />
          {/* Light overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-12 mt-8">
              <h1 className="text-7xl lg:text-9xl xl:text-[12rem] font-black mb-8 drop-shadow-2xl uppercase tracking-tight">
                <span className="text-white">G</span><span className="text-yellow-400">a</span><span className="text-white">r</span><span className="text-blue-800">a</span><span className="text-white">g</span><span className="text-yellow-400">e</span><span className="text-red-800">360</span>
              </h1>
            </div>
            <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 drop-shadow-xl uppercase tracking-wide">
              Vehicle Service
              <span className="text-primary-400 block">Made Simple</span>
            </h2>
            <p className="text-lg lg:text-xl text-white mb-12 max-w-4xl mx-auto drop-shadow-xl font-light leading-relaxed">
              Manage your garage operations with our comprehensive vehicle service management platform. 
              No complexity, no hassle - just efficient service management.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/register"
                className="btn-primary flex items-center space-x-3 text-xl px-12 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold"
              >
                <span>Create Account</span>
                <FiArrowRight className="text-xl" />
              </Link>
              <Link
                to="/login"
                className="btn-secondary flex items-center space-x-3 text-xl px-12 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-white/20 backdrop-blur-sm border-white/40 font-semibold"
              >
                <span>Log In</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-5">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;