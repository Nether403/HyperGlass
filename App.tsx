import React, { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { CodePreview } from './components/CodePreview';
import { Button } from './components/Button';
import { CommandInput } from './components/CommandInput';
import { HelpModal } from './components/HelpModal';
import { Assistant } from './components/Assistant';
import { generateCodeFromSketch, refineCode } from './services/geminiService';
import { AppState, GeneratedResult, UploadedImage } from './types';
import { Wand2, RotateCcw, Terminal, AlertCircle, ExternalLink, Zap, Aperture, ArrowRight, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New Inputs
  const [initialContext, setInitialContext] = useState("");
  const [refinePrompt, setRefinePrompt] = useState("");
  
  // UI State
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.hasSelectedApiKey) {
      const hasKey = await aistudio.hasSelectedApiKey();
      setApiKeyReady(hasKey);
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      try {
        await aistudio.openSelectKey();
        setApiKeyReady(true);
        setAppState(AppState.IDLE);
        setErrorMsg(null);
      } catch (e) {
        console.error(e);
        if (e instanceof Error && e.message.includes("Requested entity was not found")) {
             setApiKeyReady(false);
        }
      }
    }
  };

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedImage({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: e.target.result as string
        });
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;
    
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const result = await generateCodeFromSketch(uploadedImage.base64, initialContext);
      setGeneratedResult(result);
      setAppState(AppState.SUCCESS);
    } catch (e) {
      console.error(e);
      setAppState(AppState.ERROR);
      setErrorMsg(e instanceof Error ? e.message : "An unknown error occurred.");
    }
  };

  const handleRefine = async () => {
    if (!uploadedImage || !generatedResult || !refinePrompt.trim()) return;

    setAppState(AppState.REFINING);
    try {
      const result = await refineCode(
        uploadedImage.base64, 
        generatedResult.html, 
        refinePrompt
      );
      setGeneratedResult(result);
      setRefinePrompt(""); // Clear input after success
      setAppState(AppState.SUCCESS);
    } catch (e) {
      console.error(e);
      setAppState(AppState.ERROR); // Or keep Success but show toast
      setErrorMsg(e instanceof Error ? e.message : "Refinement failed.");
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setGeneratedResult(null);
    setInitialContext("");
    setRefinePrompt("");
    setAppState(AppState.IDLE);
    setErrorMsg(null);
  };

  // ---------------------------------------------------------------------------
  // View: API Key Selection
  // ---------------------------------------------------------------------------
  if (!apiKeyReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-none p-10 shadow-2xl relative text-center group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent"></div>
          
          <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-orange/20 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
            <Aperture size={48} className="text-brand-orange animate-spin-slow" />
          </div>
          
          <h1 className="text-3xl font-bold font-orbitron text-white mb-2 tracking-widest uppercase">
            Protocol <span className="text-brand-orange">Initiate</span>
          </h1>
          <p className="text-slate-400 mb-8 font-sans">
            Authentication required to access the Neural Prototyping Engine.
          </p>
          
          <div className="space-y-4">
            <Button onClick={handleSelectKey} className="w-full">
              Authenticate API Key
            </Button>
            <div className="text-[10px] text-slate-500 font-orbitron uppercase tracking-wider">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange flex items-center justify-center gap-1 transition-colors">
                Secure Connection Required <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // View: Main Application
  // ---------------------------------------------------------------------------
  return (
    <div className="h-screen flex flex-col font-sans relative z-10">
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <Assistant />
      
      {/* Header */}
      <header className="flex-none h-16 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-6 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-brand-orange">
             <Aperture size={24} />
          </div>
          <h1 className="font-bold font-orbitron text-lg tracking-widest text-white uppercase">
            Hyper<span className="text-brand-orange">Glass</span> <span className="text-slate-500 text-xs align-top ml-1">v3.1</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/5">
                <span className={`w-1.5 h-1.5 rounded-full ${appState === AppState.ANALYZING || appState === AppState.REFINING ? 'bg-brand-orange animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                <span className="text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">
                  {appState === AppState.ANALYZING || appState === AppState.REFINING ? 'PROCESSING' : 'SYSTEM ONLINE'}
                </span>
             </div>

             <button 
                onClick={() => setIsHelpOpen(true)}
                className="text-slate-400 hover:text-brand-orange transition-colors"
                title="System Manual"
             >
                <HelpCircle size={20} />
             </button>
             
             {uploadedImage && (appState === AppState.SUCCESS || appState === AppState.ERROR || appState === AppState.REFINING) && (
                 <Button variant="outline" onClick={handleReset} className="h-8 text-xs px-4">
                    <RotateCcw size={12} className="mr-2" />
                    Reset
                 </Button>
            )}
        </div>
      </header>

      {/* Main Content Split */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Input / Source */}
        <div className={`${uploadedImage && (appState === AppState.SUCCESS || appState === AppState.REFINING) ? 'w-1/4 min-w-[320px]' : 'w-full max-w-4xl mx-auto'} transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col p-8 border-r border-white/5 relative z-10 bg-slate-950/30 backdrop-blur-sm scrollbar-thin overflow-y-auto`}>
            
            {/* Initial Upload State */}
            {!uploadedImage && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                     <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center px-3 py-1 mb-4 border border-brand-orange/30 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-orbitron tracking-widest uppercase">
                            <Zap size={12} className="mr-1" />
                            Gemini 3 Pro Powered
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold font-orbitron text-white mb-4 tracking-tight">
                            VISUAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-red">SYNTHESIS</span>
                        </h2>
                        <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                            Upload a wireframe sketch. The engine will interpret the visual hierarchy and compile production-ready React code.
                        </p>
                     </div>
                     <div className="w-full max-w-xl relative">
                        {/* Decorative glow behind upload zone */}
                        <div className="absolute -inset-4 bg-brand-orange/20 blur-2xl rounded-full opacity-20 pointer-events-none"></div>
                        <UploadZone onImageSelected={handleImageSelect} />
                     </div>
                </div>
            )}

            {/* Image Loaded State */}
            {uploadedImage && (
                <div className="flex flex-col h-full animate-in fade-in duration-500 gap-6">
                    
                    {/* Source Viewer */}
                    <div className="flex-none">
                        <div className="flex justify-between items-end mb-2 border-b border-white/5 pb-2">
                            <h3 className="text-xs font-bold font-orbitron text-brand-orange uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={14} /> Source Input
                            </h3>
                            {appState === AppState.IDLE && (
                                <button onClick={() => setUploadedImage(null)} className="text-xs text-red-400 hover:text-red-300 font-orbitron uppercase tracking-wider hover:underline">Abort</button>
                            )}
                        </div>

                        <div className="relative w-full aspect-video rounded-none overflow-hidden border border-white/10 bg-black/40 group">
                            <img 
                                src={uploadedImage.previewUrl} 
                                alt="Uploaded sketch" 
                                className="w-full h-full object-contain opacity-80"
                            />
                            
                            {/* Scanning Overlay */}
                            {(appState === AppState.ANALYZING || appState === AppState.REFINING) && (
                                <div className="absolute inset-0 bg-slate-950/60 z-10 flex flex-col items-center justify-center">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-orange shadow-[0_0_50px_20px_rgba(249,115,22,0.5)] animate-scan"></div>
                                    <div className="relative z-20">
                                        <div className="w-12 h-12 border-2 border-brand-orange rounded-full border-t-transparent animate-spin"></div>
                                    </div>
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pre-Generation Context Input */}
                    {appState === AppState.IDLE && (
                        <div className="flex-1 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
                           <CommandInput 
                              value={initialContext}
                              onChange={setInitialContext}
                              placeholder="Describe your app (e.g., 'Modern dark mode dashboard for finance')..."
                              label="MISSION BRIEF"
                              multiline={true}
                           />
                           
                           <Button onClick={handleGenerate} className="w-full text-lg mt-auto" icon={<Wand2 size={18}/>}>
                                Initialize Sequence
                           </Button>
                        </div>
                    )}

                    {/* Refinement Input (Post-Generation) */}
                    {(appState === AppState.SUCCESS || appState === AppState.REFINING || appState === AppState.ERROR) && (
                         <div className="flex-1 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
                             <div className="flex-1"></div> {/* Spacer */}
                             
                             {appState === AppState.ERROR && (
                                <div className="p-4 bg-red-950/30 border border-red-500/30 text-red-200 text-sm mb-4">
                                    <div className="flex items-center gap-2 mb-2 text-red-400 font-bold font-orbitron text-xs tracking-widest uppercase">
                                        <AlertCircle size={14} /> Critical Failure
                                    </div>
                                    <p className="opacity-80 font-mono text-xs">{errorMsg}</p>
                                </div>
                             )}

                             <div className="bg-slate-900/50 border border-white/5 p-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-1">
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-brand-orange rounded-full"></div>
                                        <div className="w-1 h-1 bg-brand-orange rounded-full"></div>
                                        <div className="w-1 h-1 bg-brand-orange rounded-full"></div>
                                    </div>
                                </div>
                                
                                <CommandInput 
                                    value={refinePrompt}
                                    onChange={setRefinePrompt}
                                    onSubmit={handleRefine}
                                    isLoading={appState === AppState.REFINING}
                                    placeholder="Enter modification command (e.g., 'Make header blue')..."
                                    label="REFINEMENT PROTOCOL"
                                />
                                
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        STATUS: {appState === AppState.REFINING ? 'COMPILING PATCH...' : 'AWAITING INPUT'}
                                    </span>
                                    <button 
                                        onClick={handleRefine} 
                                        disabled={appState === AppState.REFINING || !refinePrompt.trim()}
                                        className="text-xs font-orbitron text-brand-orange hover:text-white disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-1 transition-colors"
                                    >
                                        Execute <ArrowRight size={12} />
                                    </button>
                                </div>
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>

        {/* Right Panel: Output */}
        {(appState === AppState.SUCCESS || appState === AppState.REFINING || (appState === AppState.ERROR && generatedResult)) && generatedResult && (
             <div className="w-3/4 p-6 animate-in slide-in-from-right duration-700 fade-in bg-slate-950/20 backdrop-blur-sm relative">
                {appState === AppState.REFINING && (
                    <div className="absolute inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <h2 className="text-2xl font-orbitron text-white tracking-widest animate-pulse">RECOMPILING</h2>
                            <p className="text-brand-orange font-mono text-sm mt-2">Applying modifications...</p>
                        </div>
                    </div>
                )}
                <CodePreview 
                    htmlCode={generatedResult.html} 
                    reactCode={generatedResult.react} 
                    explanation={generatedResult.explanation}
                />
             </div>
        )}

      </main>
    </div>
  );
};

export default App;