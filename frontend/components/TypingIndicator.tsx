import React from 'react';
import { Zap } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full justify-start mb-5">
      <div className="flex max-w-[85%] flex-row items-end gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-800 text-brand-neon border border-brand-neon/50 flex items-center justify-center shadow-lg">
          <Zap size={16} className="fill-brand-neon/20" />
        </div>
        <div className="px-5 py-4 rounded-2xl bg-dark-800 rounded-bl-sm border border-dark-600 flex items-center gap-1.5 shadow-md">
          <div className="w-1.5 h-1.5 bg-brand-neon rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-brand-magenta rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};
