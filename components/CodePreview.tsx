import React, { useState } from 'react';
import { Code2, Eye, Copy, Check, Terminal, Cpu } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodePreviewProps {
  htmlCode: string;
  reactCode: string;
  explanation: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ htmlCode, reactCode, explanation }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'react' | 'info'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTabStyle = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `
      px-4 py-2 text-xs font-bold font-orbitron tracking-wider flex items-center gap-2 transition-all duration-300 relative overflow-hidden
      ${isActive 
        ? 'text-brand-orange bg-white/5 border-b-2 border-brand-orange shadow-[0_4px_20px_-10px_rgba(249,115,22,0.5)]' 
        : 'text-slate-400 hover:text-white hover:bg-white/5 border-b-2 border-transparent'}
    `;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-none shadow-2xl relative overflow-hidden group">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent opacity-50"></div>

      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-2 bg-black/20 border-b border-white/5">
        <div className="flex">
          <button onClick={() => setActiveTab('preview')} className={getTabStyle('preview')}>
            <Eye size={14} />
            <span>VISUAL</span>
          </button>
          <div className="w-[1px] h-4 bg-white/10 my-auto"></div>
          <button onClick={() => setActiveTab('html')} className={getTabStyle('html')}>
            <Code2 size={14} />
            <span>HTML</span>
          </button>
          <div className="w-[1px] h-4 bg-white/10 my-auto"></div>
          <button onClick={() => setActiveTab('react')} className={getTabStyle('react')}>
            <Code2 size={14} />
            <span>REACT</span>
          </button>
          <div className="w-[1px] h-4 bg-white/10 my-auto"></div>
           <button onClick={() => setActiveTab('info')} className={getTabStyle('info')}>
            <Cpu size={14} />
            <span>LOGS</span>
          </button>
        </div>
        
        {(activeTab === 'html' || activeTab === 'react') && (
          <button
            onClick={() => handleCopy(activeTab === 'html' ? htmlCode : reactCode)}
            className="mr-2 p-1.5 text-slate-400 hover:text-brand-orange transition-colors border border-transparent hover:border-brand-orange/30 rounded bg-white/0 hover:bg-white/5"
            title="Copy Code"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-slate-950/50">
        {activeTab === 'preview' && (
          <iframe
            title="Live Preview"
            srcDoc={htmlCode}
            className="w-full h-full bg-white"
            sandbox="allow-scripts"
          />
        )}

        {activeTab === 'html' && (
          <div className="absolute inset-0 overflow-auto scrollbar-thin">
            <SyntaxHighlighter
              language="html"
              style={atomOneDark}
              customStyle={{ margin: 0, padding: '1.5rem', height: '100%', fontSize: '0.85rem', background: 'transparent' }}
            >
              {htmlCode}
            </SyntaxHighlighter>
          </div>
        )}

        {activeTab === 'react' && (
          <div className="absolute inset-0 overflow-auto scrollbar-thin">
            <SyntaxHighlighter
              language="tsx"
              style={atomOneDark}
              customStyle={{ margin: 0, padding: '1.5rem', height: '100%', fontSize: '0.85rem', background: 'transparent' }}
            >
              {reactCode}
            </SyntaxHighlighter>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="p-8 text-slate-300 leading-relaxed overflow-auto h-full font-mono text-sm">
            <div className="flex items-center gap-2 mb-6 text-brand-orange border-b border-brand-orange/20 pb-2">
                <Terminal size={16} />
                <h3 className="text-sm font-bold font-orbitron tracking-widest uppercase">Analysis Log</h3>
            </div>
            <div className="prose prose-invert max-w-none prose-p:text-slate-400 prose-headings:font-orbitron prose-headings:text-white">
                <p className="whitespace-pre-wrap font-sans">{explanation}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Status Bar */}
      <div className="h-6 bg-black/40 border-t border-white/5 flex items-center justify-between px-4 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
         <span>Mode: {activeTab.toUpperCase()}</span>
         <span>SECURE CONNECTION</span>
      </div>
    </div>
  );
};