import React, { useState } from 'react';
import { X, Map as MapIcon, Navigation } from 'lucide-react';
import { Stadium, Destination } from '../types';

interface EscapeMapProps {
  stadium: Stadium;
  destination: Destination;
  isAgentTyping: boolean;
}

export const EscapeMap: React.FC<EscapeMapProps> = ({ stadium, destination, isAgentTyping }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Construct a Google Maps directions URL. 
  // We use the stadium's exact coordinates for the origin, and a search query for the destination.
  const origin = `${stadium.latitude},${stadium.longitude}`;
  const destQuery = encodeURIComponent(`${destination.name} near ${stadium.name}, ${stadium.city}`);
  const mapUrl = `https://maps.google.com/maps?saddr=${origin}&daddr=${destQuery}&output=embed`;

  if (!isExpanded) {
    // Hide the map trigger completely while the agent is typing.
    // It will pop in and "blink" only after the text response is finished.
    if (isAgentTyping) return null;

    return (
      <div className="w-full bg-dark-800 border-t border-dark-600 p-4 animate-fade-in z-10">
        <button 
          onClick={() => setIsExpanded(true)}
          className="relative w-full bg-dark-900 border-2 border-brand-cyan p-3.5 rounded-xl flex items-center justify-center gap-2 text-brand-cyan hover:bg-dark-700 transition-all overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.2)] group"
        >
          {/* Blinking/Pulsing background layer */}
          <div className="absolute inset-0 bg-brand-cyan/20 animate-pulse"></div>
          
          <MapIcon size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest relative z-10">Show Full Escape Map</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-dark-900 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-4 py-4 bg-dark-800 border-b border-dark-600 shadow-lg z-20">
        <div className="flex items-center gap-2">
          <Navigation size={18} className="text-brand-magenta" />
          <span className="text-sm font-bold text-white tracking-widest uppercase">Live Escape Route</span>
        </div>
        <button 
          onClick={() => setIsExpanded(false)} 
          className="text-gray-400 hover:text-white bg-dark-700 hover:bg-dark-600 p-2 rounded-full transition-colors"
          aria-label="Close Map"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Google Maps Iframe */}
      <div className="flex-1 relative bg-dark-900">
        {/* Loading placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <MapIcon size={32} className="text-brand-cyan" />
            <span className="text-sm font-bold uppercase tracking-widest text-brand-cyan">Loading Map...</span>
          </div>
        </div>
        
        <iframe 
          className="absolute inset-0 w-full h-full z-10"
          frameBorder="0" 
          style={{ border: 0 }} 
          src={mapUrl} 
          allowFullScreen 
          title="Escape Route Map"
        ></iframe>
      </div>
    </div>
  );
};
