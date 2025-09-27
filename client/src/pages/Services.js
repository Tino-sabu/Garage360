import React, { useState, useEffect } from 'react';
import { FiTool, FiSettings, FiZap, FiShield, FiDroplet, FiWind, FiBattery, FiCpu } from 'react-icons/fi';

const Services = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000); // Show content after 1 second

    return () => clearTimeout(timer);
  }, []);
  const services = [
    {
      id: 1,
      name: "Oil Change & Maintenance",
      description: "Complete oil change service with filter replacement and basic vehicle inspection",
      price: "₹3,500 - ₹6,000",
      duration: "30-45 mins",
      icon: FiDroplet,
      category: "maintenance"
    },
    {
      id: 2,
      name: "Brake Repair & Service",
      description: "Comprehensive brake system inspection, repair, and replacement services",
      price: "₹12,000 - ₹32,000",
      duration: "2-4 hours",
      icon: FiShield,
      category: "repair"
    },
    {
      id: 3,
      name: "Engine Diagnostics",
      description: "Advanced computer diagnostics to identify engine problems and performance issues",
      price: "₹8,000 - ₹16,000",
      duration: "1-2 hours",
      icon: FiCpu,
      category: "diagnostic"
    },
    {
      id: 4,
      name: "Tire Services",
      description: "Tire rotation, balancing, alignment, and replacement services",
      price: "₹6,500 - ₹24,000",
      duration: "1-2 hours",
      icon: FiSettings,
      category: "maintenance"
    },
    {
      id: 5,
      name: "Battery Service",
      description: "Battery testing, replacement, and electrical system diagnostics",
      price: "₹9,500 - ₹20,000",
      duration: "30 mins - 1 hour",
      icon: FiBattery,
      category: "electrical"
    },
    {
      id: 6,
      name: "Air Conditioning Service",
      description: "AC system inspection, repair, and refrigerant recharge services",
      price: "₹7,200 - ₹24,000",
      duration: "1-3 hours",
      icon: FiWind,
      category: "comfort"
    },
    {
      id: 7,
      name: "Transmission Service",
      description: "Transmission fluid change, repair, and complete rebuilds",
      price: "₹16,000 - ₹2,40,000",
      duration: "2-8 hours",
      icon: FiTool,
      category: "major"
    },
    {
      id: 8,
      name: "Electrical System Repair",
      description: "Complete electrical diagnostics and repair for all vehicle systems",
      price: "₹8,000 - ₹40,000",
      duration: "1-4 hours",
      icon: FiZap,
      category: "electrical"
    }
  ];

  const categories = [
    { name: "All Services", filter: "all" },
    { name: "Maintenance", filter: "maintenance" },
    { name: "Repair", filter: "repair" },
    { name: "Electrical", filter: "electrical" },
    { name: "Diagnostic", filter: "diagnostic" }
  ];

  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/pic2.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      {/* Content - Show after 1 second */}
      {showContent && (
        <div className="relative z-10 p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Our Services</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional automotive services with expert technicians and quality parts. 
              Your vehicle deserves the best care.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category.filter}
                onClick={() => setSelectedCategory(category.filter)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.filter
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20 backdrop-blur-sm'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div 
                  key={service.id} 
                  className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300 hover:transform hover:scale-105 border border-white border-opacity-20"
                >
                  <div className="text-center mb-4">
                    <IconComponent className="text-blue-400 text-4xl mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-400 font-bold">{service.price}</span>
                      <span className="text-gray-400">{service.duration}</span>
                    </div>
                    
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 font-medium">
                      Book Service
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 max-w-4xl mx-auto border border-white border-opacity-20">
              <h2 className="text-3xl font-bold text-white mb-4">Need Custom Service?</h2>
              <p className="text-gray-300 mb-6 text-lg">
                Can't find what you're looking for? Contact us for custom automotive solutions 
                and specialized services tailored to your vehicle's needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-300">
                  Contact Us
                </button>
                <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300">
                  Get Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Services;