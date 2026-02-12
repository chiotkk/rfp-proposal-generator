import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoaderProps {
  message: string;
  progress?: number;
}

export const Loader: React.FC<LoaderProps> = ({ message, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white p-4 rounded-full shadow-lg border border-primary-100">
            <Sparkles className="w-8 h-8 text-primary-500 animate-pulse" />
        </div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-slate-800">{message}</h3>
      <p className="text-slate-500 mt-2 max-w-sm">
        Our AI is parsing the requirements and matching them with your best building blocks.
      </p>
      
      {progress !== undefined && (
        <div className="w-64 mt-8 space-y-2">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary-500 transition-all duration-700 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Analysis</span>
                <span>{progress}%</span>
            </div>
        </div>
      )}

      <div className="mt-4 flex items-center space-x-2 text-sm text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Processing via Gemini 3 Flash...</span>
      </div>
    </div>
  );
};