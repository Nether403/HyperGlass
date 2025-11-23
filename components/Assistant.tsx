import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageSquare, Sparkles, Minimize2 } from 'lucide-react';
import { chatWithAssistant, ChatMessage } from '../services/geminiService';

export const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Greetings. I am Hyper-Glass Assist. How can I optimize your design workflow today?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(newHistory, userMsg);
      setMessages([...newHistory, { role: 'model', text: response }]);
    } catch (error) {
      setMessages([...newHistory, { role: 'model', text: "Connection interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-96 bg-slate-950/90 backdrop-blur-xl border border-brand-orange/30 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-brand-gradient">
            <div className="flex items-center gap-2 text-white">
              <Bot size={18} />
              <span className="font-orbitron text-xs font-bold tracking-widest uppercase">AI Design Consultant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-black/20">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] p-3 text-xs leading-relaxed rounded
                  ${msg.role === 'user' 
                    ? 'bg-brand-orange/20 border border-brand-orange/30 text-white rounded-br-none' 
                    : 'bg-slate-800/50 border border-white/10 text-slate-300 rounded-bl-none'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 border border-white/10 p-3 rounded rounded-bl-none flex gap-1 items-center">
                   <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce delay-100"></span>
                   <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-900/80 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about concepts, colors..."
              className="flex-1 bg-transparent text-xs text-white font-sans focus:outline-none placeholder:text-slate-600"
              autoFocus
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="text-brand-orange hover:text-white disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border
          ${isOpen 
            ? 'bg-slate-800 text-slate-400 border-white/20 rotate-90' 
            : 'bg-brand-gradient text-white border-transparent hover:scale-110 hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse-slow'}
        `}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>
    </div>
  );
};