import React from 'react';
import { Terminal, Send, Sparkles } from 'lucide-react';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  label?: string;
  isLoading?: boolean;
  multiline?: boolean;
}

export const CommandInput: React.FC<CommandInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter instructions...",
  label = "COMMAND LINE",
  isLoading = false,
  multiline = false
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative group w-full">
      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <Terminal size={12} className="text-brand-orange" />
        <span className="text-[10px] font-orbitron tracking-widest text-slate-400 uppercase">
          {label}
        </span>
      </div>

      {/* Input Container */}
      <div className={`
        relative bg-slate-900/80 backdrop-blur-md border border-white/10
        transition-all duration-300 overflow-hidden
        ${isLoading ? 'opacity-70 pointer-events-none' : 'hover:border-white/20 focus-within:border-brand-orange/50 focus-within:shadow-[0_0_20px_rgba(249,115,22,0.15)]'}
      `}>
        {/* Decorative corner markers */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-orange/50"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-orange/50"></div>

        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full bg-transparent text-sm text-slate-200 font-mono p-4 min-h-[100px] resize-none focus:outline-none placeholder:text-slate-600"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full bg-transparent text-sm text-slate-200 font-mono p-4 pr-12 focus:outline-none placeholder:text-slate-600"
          />
        )}

        {/* Submit Button (Integrated) */}
        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className={`
              absolute right-2 bottom-2 p-2 rounded transition-all duration-300
              ${isLoading || !value.trim() 
                ? 'text-slate-700 bg-transparent' 
                : 'text-white bg-brand-gradient hover:shadow-[0_0_10px_rgba(249,115,22,0.5)]'}
            `}
          >
            {isLoading ? (
               <Sparkles size={16} className="animate-spin" />
            ) : (
               <Send size={16} />
            )}
          </button>
        )}
      </div>

      {/* Bottom glowing line on focus */}
      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand-orange transition-all duration-500 group-focus-within:w-full"></div>
    </div>
  );
};
