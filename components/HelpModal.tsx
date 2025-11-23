import React, { useState } from 'react';
import { X, Book, HelpCircle, Cpu, PenTool, Code } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq'>('guide');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl h-[80vh] bg-slate-950/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden">
        
        {/* Tech Borders */}
        <div className="absolute top-0 left-0 w-20 h-[1px] bg-brand-orange"></div>
        <div className="absolute bottom-0 right-0 w-20 h-[1px] bg-brand-orange"></div>
        <div className="absolute top-0 left-0 w-[1px] h-20 bg-brand-orange"></div>
        <div className="absolute bottom-0 right-0 w-[1px] h-20 bg-brand-orange"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <Book className="text-brand-orange" size={20} />
            <h2 className="text-xl font-bold font-orbitron tracking-widest text-white uppercase">
              System <span className="text-brand-orange">Manual</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-3 text-xs font-bold font-orbitron tracking-widest uppercase transition-all
              ${activeTab === 'guide' 
                ? 'text-brand-orange bg-white/5 border-b-2 border-brand-orange' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-b-2 border-transparent'}`}
          >
            Operational Guide
          </button>
          <div className="w-[1px] bg-white/10"></div>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-3 text-xs font-bold font-orbitron tracking-widest uppercase transition-all
              ${activeTab === 'faq' 
                ? 'text-brand-orange bg-white/5 border-b-2 border-brand-orange' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-b-2 border-transparent'}`}
          >
            FAQ Database
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {activeTab === 'guide' ? (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-orbitron text-white mb-4 flex items-center gap-2">
                  <span className="text-brand-orange">01.</span> Input Phase
                </h3>
                <div className="pl-6 border-l border-white/10 space-y-2 text-slate-300 text-sm leading-relaxed">
                  <p>Upload a clear image of your wireframe or sketch. Supported formats: PNG, JPG, WEBP.</p>
                  <p className="flex items-start gap-2 mt-2 text-slate-400">
                    <PenTool size={14} className="mt-1 text-brand-orange" />
                    <span>Tip: Use dark markers on white paper or high-contrast digital sketches for optimal recognition.</span>
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-orbitron text-white mb-4 flex items-center gap-2">
                  <span className="text-brand-orange">02.</span> Mission Brief
                </h3>
                <div className="pl-6 border-l border-white/10 space-y-2 text-slate-300 text-sm leading-relaxed">
                  <p>Before generation, use the "Mission Brief" field to provide context. Tell the AI about the app's purpose, preferred color scheme, or specific style requirements.</p>
                  <p className="italic text-slate-500">Example: "A medical dashboard in dark mode with blue accents."</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-orbitron text-white mb-4 flex items-center gap-2">
                  <span className="text-brand-orange">03.</span> Refinement Protocol
                </h3>
                <div className="pl-6 border-l border-white/10 space-y-2 text-slate-300 text-sm leading-relaxed">
                  <p>The output is not final. Use the "Refinement Protocol" input below the source image to iteratively adjust the design.</p>
                  <p className="flex items-start gap-2 mt-2 text-slate-400">
                    <Code size={14} className="mt-1 text-brand-orange" />
                    <span>Commands like "Make buttons bigger" or "Change layout to 2 columns" work best.</span>
                  </p>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                {
                  q: "What kind of sketches work best?",
                  a: "Clean, high-contrast sketches. Clearly outline buttons, inputs, and image placeholders. Scribbled text is okay, but readable labels help the AI understand context."
                },
                {
                  q: "Can I use this for production code?",
                  a: "The code is a high-fidelity prototype. While it uses standard React and Tailwind, you will likely need to refactor it for your specific data architecture and state management before production use."
                },
                {
                  q: "Why did the generation fail?",
                  a: "This usually happens if the image is too blurry, complex, or if the API key quota is exceeded. Try simplifying the sketch or checking your connection."
                },
                {
                  q: "Is my API key stored?",
                  a: "No. The API key is used exclusively in your browser session to communicate with Google's Gemini API. It is never saved to a server."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded hover:border-brand-orange/30 transition-colors">
                  <h4 className="font-bold text-slate-200 mb-2 flex items-start gap-2">
                    <HelpCircle size={16} className="text-brand-orange mt-0.5 shrink-0" />
                    {item.q}
                  </h4>
                  <p className="text-slate-400 text-sm pl-6 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Status */}
        <div className="p-4 border-t border-white/10 bg-black/40 text-[10px] font-mono text-slate-600 flex justify-between uppercase tracking-widest">
          <span>Manual v3.1</span>
          <span>Authorized Personnel Only</span>
        </div>
      </div>
    </div>
  );
};