import React from 'react';
import { MapPin, Navigation, ChevronRight } from 'lucide-react';
import { Stadium, Destination } from '../types';
import { STADIUMS, GENERIC_DESTINATIONS } from '../data/stadiums';

interface QuickSelectProps {
  selectedStadium: Stadium | null;
  onSelectStadium: (stadium: Stadium) => void;
  onSelectDestination: (destination: Destination) => void;
}

export const QuickSelect: React.FC<QuickSelectProps> = ({
  selectedStadium,
  onSelectStadium,
  onSelectDestination,
}) => {
  
  const getCountryFlag = (country: string) => {
    switch(country) {
      case 'USA': return '🇺🇸';
      case 'Mexico': return '🇲🇽';
      case 'Canada': return '🇨🇦';
      default: return '🏟️';
    }
  };

  const getDestIcon = (type: string) => {
    switch(type) {
      case 'metro': return '🚇';
      case 'bus_station': return '🚌';
      case 'parking': return '🚕';
      case 'airport': return '✈️';
      case 'landmark': return '🏙️';
      default: return '📍';
    }
  };

  if (!selectedStadium) {
    return (
      <div className="w-full bg-dark-800 border-t border-dark-600 p-3 animate-fade-in">
        <div className="flex items-center gap-2 mb-3 px-1">
          <MapPin size={16} className="text-brand-neon" />
          <span className="text-sm font-bold text-white tracking-wide uppercase">Select Stadium</span>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
          {STADIUMS.map((stadium) => (
            <button
              key={stadium.id}
              onClick={() => onSelectStadium(stadium)}
              className="flex-shrink-0 w-40 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-brand-neon/50 rounded-xl p-3 text-left transition-all group"
            >
              <div className="text-xs text-gray-400 mb-1 flex justify-between items-center">
                <span>{getCountryFlag(stadium.country)} {stadium.city}</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-brand-neon transition-opacity" />
              </div>
              <div className="font-bold text-white text-sm leading-tight truncate">
                {stadium.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-dark-800 border-t border-dark-600 p-3 animate-fade-in">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Navigation size={16} className="text-brand-magenta" />
          <span className="text-sm font-bold text-white tracking-wide uppercase">Where to?</span>
        </div>
        <div className="text-xs text-brand-neon bg-brand-neon/10 px-2 py-1 rounded-md truncate max-w-[150px]">
          From: {selectedStadium.name}
        </div>
      </div>
      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
        {GENERIC_DESTINATIONS.map((dest) => (
          <button
            key={dest.id}
            onClick={() => onSelectDestination(dest)}
            className="flex-shrink-0 w-36 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-brand-magenta/50 rounded-xl p-3 text-left transition-all group flex flex-col items-center text-center"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              {getDestIcon(dest.type)}
            </div>
            <div className="font-bold text-white text-xs leading-tight">
              {dest.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
