import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { Message, ChatState, Stadium, Destination, Language } from './types';
import { sendAgentMessage, initAgent } from './services/agent';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { QuickSelect } from './components/QuickSelect';
import { EscapeMap } from './components/EscapeMap';
import { LANGUAGES } from './data/languages';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'agent',
  content: "Welcome to **KickOut 26**. I monitor live crowd density, transit feeds, and surge pricing for all World Cup venues.\n\nSelect your stadium and destination below, or type your request, and I'll find your fastest escape route.",
  timestamp: new Date(),
};

export default function App() {
  const [state, setState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isLoading: false,
    error: null,
  });
  const [inputValue, setInputValue] = useState('');
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null);
  const [showQuickSelect, setShowQuickSelect] = useState(true);
  
  // Active Route State for Map
  const [activeRoute, setActiveRoute] = useState<{stadium: Stadium, destination: Destination} | null>(null);
  
  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      initAgent(selectedLanguage.name);
    } catch (err) {
      setState(prev => ({ ...prev, error: "Failed to initialize agent. Check API key." }));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isLoading, showQuickSelect, activeRoute]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || state.isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true,
      error: null,
    }));
    setInputValue('');
    setShowQuickSelect(false);

    try {
      const responseText = await sendAgentMessage(userMsg.content, selectedLanguage.name);
      
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: responseText,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, agentMsg],
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "An unexpected error occurred.",
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleStadiumSelect = (stadium: Stadium) => {
    setSelectedStadium(stadium);
  };

  const handleDestinationSelect = (destination: Destination) => {
    if (selectedStadium) {
      setActiveRoute({ stadium: selectedStadium, destination });
      const prompt = `I'm at ${selectedStadium.name} (${selectedStadium.city}) and need to get to the ${destination.name}. What's the best escape route right now?`;
      handleSend(prompt);
    }
  };

  const resetSelection = () => {
    setSelectedStadium(null);
    setActiveRoute(null);
    setShowQuickSelect(true);
  };

  const handleLanguageChange = async (lang: Language) => {
    setSelectedLanguage(lang);
    setShowLangDropdown(false);
    
    // Re-initialize agent with new language
    initAgent(lang.name);

    // Ask agent to introduce itself in the new language
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const prompt = `Translate this exactly to ${lang.name}: "Language changed. I am ready to help you find the best escape route. Where are you?"`;
      const responseText = await sendAgentMessage(prompt, lang.name);
      
      const agentMsg: Message = {
        id: Date.now().toString(),
        role: 'agent',
        content: responseText,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, agentMsg],
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to change language. Please try again.",
      }));
    }
  };

  return (
    <div className="flex justify-center w-full min-h-screen bg-dark-900 font-sans selection:bg-brand-magenta selection:text-white">
      {/* Mobile Container */}
      <div className="w-full max-w-md h-[100dvh] flex flex-col bg-dark-900 relative shadow-2xl overflow-hidden border-x border-dark-800">
        
        {/* Header */}
        <header className="flex-none bg-dark-800/90 backdrop-blur-md border-b border-dark-600 p-4 z-20 relative overflow-visible">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-neon via-brand-cyan to-brand-magenta animate-gradient-x"></div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3">
              <div className="bg-dark-900 border border-dark-600 p-2 rounded-xl shadow-inner">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand-neon to-brand-cyan">26</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight tracking-wider uppercase">KickOut</h1>
                <div className="flex items-center gap-1.5 text-xs text-brand-neon font-medium tracking-wide">
                  <Activity size={12} className="animate-pulse" />
                  <span>LIVE ESCAPE INTEL</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-1.5 p-2 text-gray-300 hover:text-brand-cyan transition-colors bg-dark-700 hover:bg-dark-600 rounded-full border border-dark-600"
                  aria-label="Select Language"
                >
                  <Globe size={16} />
                  <span className="text-xs font-bold uppercase w-5 text-center">{selectedLanguage.code}</span>
                </button>

                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="max-h-72 overflow-y-auto hide-scrollbar py-1">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang)}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-dark-700 transition-colors flex items-center justify-between ${
                            selectedLanguage.code === lang.code ? 'text-brand-cyan bg-dark-700/50 font-bold' : 'text-gray-300'
                          }`}
                        >
                          <span>{lang.nativeName}</span>
                          <span className="text-xs opacity-80">{lang.flag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!showQuickSelect && (
                <button 
                  onClick={resetSelection}
                  className="p-2 text-gray-400 hover:text-brand-magenta transition-colors bg-dark-700 hover:bg-dark-600 rounded-full border border-dark-600"
                  aria-label="New Route"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 scroll-smooth bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-dark-900 z-0">
          
          {state.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {state.isLoading && <TypingIndicator />}
          
          {state.error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-brand-magenta bg-brand-magenta/10 border border-brand-magenta/30 rounded-xl">
              <AlertCircle size={16} className="flex-shrink-0" />
              <p>{state.error}</p>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </main>

        {/* Quick Select Area */}
        {showQuickSelect && (
          <QuickSelect 
            selectedStadium={selectedStadium}
            onSelectStadium={handleStadiumSelect}
            onSelectDestination={handleDestinationSelect}
          />
        )}

        {/* Map Area - Embedded at the bottom, above input */}
        {activeRoute && !showQuickSelect && (
          <EscapeMap 
            stadium={activeRoute.stadium} 
            destination={activeRoute.destination} 
            isAgentTyping={state.isLoading}
          />
        )}

        {/* Input Area */}
        <footer className="flex-none bg-dark-800 border-t border-dark-600 p-3 pb-safe z-10">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-dark-900 border border-dark-600 rounded-2xl overflow-hidden focus-within:border-brand-cyan transition-colors shadow-inner">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowQuickSelect(false)}
                placeholder="Type your location & destination..."
                className="w-full bg-transparent text-white px-4 py-3.5 outline-none placeholder-gray-500 text-sm font-medium"
                disabled={state.isLoading}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || state.isLoading}
              className="flex-shrink-0 bg-gradient-to-br from-brand-purple to-brand-magenta hover:opacity-90 disabled:from-dark-700 disabled:to-dark-700 disabled:text-gray-500 text-white p-3.5 rounded-2xl transition-all flex items-center justify-center shadow-lg"
              aria-label="Send message"
            >
              <Send size={20} className={inputValue.trim() && !state.isLoading ? 'translate-x-0.5 -translate-y-0.5' : ''} />
            </button>
          </div>
          <div className="text-center mt-3">
            <span className="text-[10px] font-medium text-gray-500 tracking-widest uppercase">Powered by Vertex AI</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
