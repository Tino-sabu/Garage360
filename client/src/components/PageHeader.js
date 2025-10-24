import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const PageHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-black border-b border-gray-800 sticky top-14 sm:top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 sm:h-16 relative">
          {/* Back Button - Left */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 p-2 rounded-lg text-white hover:bg-gray-800 transition-all"
            aria-label="Go back"
          >
            <FiArrowLeft className="text-xl sm:text-2xl" />
          </button>

          {/* Title - Centered */}
          <h1 className="flex-1 text-center text-lg sm:text-xl lg:text-2xl font-bold text-white">
            {title}
          </h1>

          {/* Spacer for balance (same width as back button) */}
          <div className="w-10 sm:w-12"></div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
