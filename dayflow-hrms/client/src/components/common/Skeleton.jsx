import React from 'react';

export const SkeletonBox = ({ className = '' }) => (
  <div className={`bg-slate-800/60 animate-pulse rounded-xl ${className}`}></div>
);

export const SkeletonText = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-slate-800/60 animate-pulse rounded ${className}`}></div>
);

export const SkeletonCard = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="w-12 h-12 rounded-xl bg-slate-800"></div>
      <div className="w-20 h-5 rounded-full bg-slate-800"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-1/3 bg-slate-800 rounded"></div>
      <div className="h-8 w-1/2 bg-slate-800 rounded"></div>
      <div className="h-3 w-2/3 bg-slate-800 rounded"></div>
    </div>
  </div>
);

export const SkeletonTableRow = () => (
  <tr className="animate-pulse border-b border-slate-800/60">
    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-800 rounded"></div></td>
    <td className="px-5 py-4"><div className="h-4 w-28 bg-slate-800 rounded"></div></td>
    <td className="px-5 py-4"><div className="h-4 w-36 bg-slate-800 rounded"></div></td>
    <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
    <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-800 rounded"></div></td>
    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-800 rounded-full"></div></td>
    <td className="px-5 py-4 text-right"><div className="h-7 w-24 bg-slate-800 rounded-lg ml-auto"></div></td>
  </tr>
);

export const SkeletonProfile = () => (
  <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
    <div className="h-8 bg-slate-800 rounded-lg w-48"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-36 h-36 rounded-full bg-slate-800"></div>
        <div className="h-6 bg-slate-800 rounded w-3/4"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      </div>
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96 space-y-6">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-slate-800 rounded-xl"></div>
          <div className="h-12 bg-slate-800 rounded-xl"></div>
          <div className="h-12 bg-slate-800 rounded-xl"></div>
          <div className="h-12 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonBox;
