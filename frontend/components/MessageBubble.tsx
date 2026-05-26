import React from 'react';
import { User, Zap } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const formatContent = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '' && i > 0 && i < text.split('\n').length - 1) {
      return <div key={i} className="h-1"></div>; // Reduced spacing for tighter lists
    }
    
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={i} className="min-h-[1.2em] mb-1 last:mb-0">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="text-brand-neon font-bold tracking-wide">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </div>
    );
  });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAgent = message.role === 'agent';

  return (
    <div className={`flex w-full ${isAgent ? 'justify-start' : 'justify-end'} mb-5`}>
      <div className={`flex max-w-[92%] ${isAgent ? 'flex-row' : 'flex-row-reverse'} items-end gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isAgent 
            ? 'bg-dark-800 text-brand-neon border border-brand-neon/50' 
            : 'bg-gradient-to-br from-brand-magenta to-brand-purple text-white'
        }`}>
          {isAgent ? <Zap size={16} className="fill-brand-neon/20" /> : <User size={16} />}
        </div>

        {/* Message Content */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
          isAgent 
            ? 'bg-dark-800 text-gray-100 rounded-bl-sm border border-dark-600' 
            : 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white rounded-br-sm'
        }`}>
          {formatContent(message.content)}
          <div className={`text-[10px] mt-1.5 text-right font-medium ${isAgent ? 'text-gray-400' : 'text-white/70'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

      </div>
    </div>
  );
};
