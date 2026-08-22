import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mx-auto">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-rose-500 tracking-wider">404</span>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Oops! The page you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Safety</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
