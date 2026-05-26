export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface Stadium {
  id: string;
  name: string;
  fifaName: string;
  city: string;
  country: string;
  capacity: number;
  latitude: number;
  longitude: number;
  stages: string[];
  timezone: string;
  isFinalVenue?: boolean;
  isOpeningVenue?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
}

export interface RouteOption {
  id: string;
  name: string;
  primaryRoute: {
    id: string;
    name: string;
    estimatedTime: number;
    distance: number;
    crowdLevel: 'low' | 'moderate' | 'high' | 'very_high';
    transportMode: 'walking' | 'metro' | 'bus' | 'taxi' | 'mixed';
    waitTime: number;
    cost?: number;
    availability: number;
    highlights: string[];
  };
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}
