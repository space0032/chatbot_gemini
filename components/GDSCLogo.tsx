import React from 'react';

export const GDSCLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
        {/* Simplified abstraction of the GDSC brackets logo */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M7 6L3 12L7 18" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 6L21 12L17 18" stroke="#DB4437" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.5 5L7.5 5" stroke="#F4B400" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M16.5 19L14.5 19" stroke="#0F9D58" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="1.5" fill="#757575"/>
        </svg>
    </div>
  );
};