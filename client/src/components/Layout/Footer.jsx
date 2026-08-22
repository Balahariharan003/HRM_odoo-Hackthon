import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto space-y-2 sm:space-y-0">
        <p>© 2026 Dayflow HRMS. All rights reserved.</p>
        <div className="flex space-x-4 text-slate-400">
          <span className="hover:text-slate-300 transition-colors">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-300 transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
