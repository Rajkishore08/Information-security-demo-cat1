import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';

interface LoadingProps {
  label?: string;
  sublabel?: string;
  type?: 'card' | 'table' | 'full';
}

export const LoadingSkeleton: React.FC<LoadingProps> = ({
  label = 'Processing Security Request...',
  sublabel = 'Querying SQLite lab.db & verifying policy integrity',
  type = 'card'
}) => {
  if (type === 'full') {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 rounded-2xl glass-card border border-indigo-900/40 text-center animate-pulse">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <Shield className="h-7 w-7 text-indigo-400 absolute" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white font-mono tracking-wide flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
            {label}
          </h4>
          <p className="text-xs text-gray-400 font-mono">{sublabel}</p>
        </div>
        <div className="w-48 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-xl border border-gray-800 bg-gray-950/60 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-800 rounded w-1/3"></div>
        <div className="h-4 bg-gray-800 rounded w-1/6"></div>
      </div>
      <div className="h-12 bg-gray-900/80 rounded-lg"></div>
      <div className="h-3 bg-gray-800 rounded w-2/3"></div>
    </div>
  );
};
