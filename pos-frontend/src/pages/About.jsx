import React from 'react';
import {
  FiX,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiInstagram,
  FiInfo,
} from 'react-icons/fi';

const About = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center animate-fadeIn p-4">
      <div className="bg-white rounded-xl p-4 w-full max-w-4xl animate-slideIn relative lg:max-h-[90vh] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <FiInfo className="text-white text-base" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About RetailEdge
          </h2>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700 transform hover:rotate-90 transition-transform duration-300"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Main Content - Responsive */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column */}
          <div className="flex-1 space-y-4">
            {/* What is RetailEdge */}
            <section className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                What is RetailEdge?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                RetailEdge is an innovative retail management platform that revolutionizes how businesses handle their operations.
                Built with modern technologies and best practices, it offers a comprehensive suite of tools for inventory management,
                sales analytics, and customer relationship management.
              </p>
            </section>

            {/* Connect With Us */}
            <section className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Connect With Us
              </h3>
              <div className="flex gap-4 flex-wrap">
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:scale-110 transition-all duration-300">
                  <FiGithub size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-400 hover:scale-110 transition-all duration-300">
                  <FiTwitter size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-700 hover:scale-110 transition-all duration-300">
                  <FiLinkedin size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:text-pink-600 hover:scale-110 transition-all duration-300">
                  <FiInstagram size={20} />
                </button>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="flex-1">
            <section className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 h-full">
              <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Key Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Advanced inventory tracking',
                  'Real-time analytics dashboard',
                  'Customer data management',
                  'Business intelligence tools',
                  'Role-based access control',
                  'Secure transaction processing',
                  'Automated reporting system',
                  'Modern REST API architecture',
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t mt-4">
          © 2025 RetailEdge. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default About;
