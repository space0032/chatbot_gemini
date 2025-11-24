import React from 'react';
import { GDSCLogo } from './GDSCLogo';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      {/* Decorative Color Bar */}
      <div className="h-1 w-full flex">
        <div className="bg-[#4285F4] flex-1"></div>
        <div className="bg-[#DB4437] flex-1"></div>
        <div className="bg-[#F4B400] flex-1"></div>
        <div className="bg-[#0F9D58] flex-1"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        <GDSCLogo className="w-10 h-10" />
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Chatbot With Gemini</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-xs text-slate-500 font-medium">Gemini Assistant Online</p>
          </div>
        </div>
      </div>
    </header>
  );
};