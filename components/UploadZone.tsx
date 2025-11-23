import React, { useCallback, useState } from 'react';
import { Upload, FileImage, Crosshair } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  }, [onImageSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelected(files[0]);
    }
  }, [onImageSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-80 group overflow-hidden transition-all duration-300
        border border-white/10 bg-slate-900/30 backdrop-blur-sm
        ${isDragging ? 'border-brand-orange/50 bg-brand-orange/5' : 'hover:border-brand-orange/30 hover:bg-slate-900/50'}
      `}
    >
      {/* Tech Corners */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l transition-colors duration-300 ${isDragging ? 'border-brand-orange' : 'border-slate-500'}`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors duration-300 ${isDragging ? 'border-brand-orange' : 'border-slate-500'}`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-colors duration-300 ${isDragging ? 'border-brand-orange' : 'border-slate-500'}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-colors duration-300 ${isDragging ? 'border-brand-orange' : 'border-slate-500'}`} />

      {/* Crosshair Center Decoration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-full h-[1px] bg-white/20"></div>
        <div className="h-full w-[1px] bg-white/20 absolute"></div>
        <div className="w-32 h-32 border border-white/10 rounded-full absolute"></div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileInput} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none z-20">
        <div className={`
          w-20 h-20 mb-6 rounded-full flex items-center justify-center border transition-all duration-300 relative
          ${isDragging 
            ? 'bg-brand-orange/20 border-brand-orange text-brand-orange shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
            : 'bg-slate-800/50 border-white/10 text-slate-400 group-hover:border-brand-orange/50 group-hover:text-brand-orange'}
        `}>
          {isDragging ? <FileImage size={32} /> : <Upload size={32} />}
          {/* Rotating ring element */}
          <div className="absolute inset-[-4px] border border-dashed border-white/20 rounded-full animate-[spin_10s_linear_infinite] opacity-30"></div>
        </div>
        
        <h3 className={`text-xl font-bold font-orbitron tracking-widest mb-2 transition-colors ${isDragging ? 'text-white' : 'text-slate-200'}`}>
          {isDragging ? 'INITIALIZING SCAN' : 'UPLOAD SKETCH'}
        </h3>
        
        <p className="text-sm text-slate-400 font-sans max-w-xs text-center leading-relaxed">
          Drag & drop your schematic or click to access local drive.
        </p>
        
        <div className="mt-6 flex items-center gap-2 text-[10px] text-brand-orange uppercase tracking-[0.2em] font-bold opacity-60">
           <Crosshair size={12} />
           <span>System Ready</span>
        </div>
      </div>
    </div>
  );
};