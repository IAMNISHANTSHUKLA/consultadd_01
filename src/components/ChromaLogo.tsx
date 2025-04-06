
import React from 'react';

const ChromaLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="animate-pulse-slow relative w-10 h-10 rounded-full bg-gradient-to-br from-chroma-purple via-chroma-blue to-chroma-pink shadow-lg flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-white"></div>
      </div>
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-chroma-pink animate-pulse-slow"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-chroma-blue animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default ChromaLogo;
