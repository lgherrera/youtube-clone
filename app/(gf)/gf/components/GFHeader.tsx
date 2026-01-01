// app/(gf)/gf/components/GFHeader.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import styles from './GFHeader.module.css';

export default function GFHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="h-[65px] w-full flex items-center justify-between px-4 sticky top-0 bg-black z-[100]">
        
        {/* Left: Back Button */}
        <div className="flex-1 flex justify-start">
          <Link href="/">
            <button className="bg-[#141414] w-[45px] h-[45px] flex items-center justify-center rounded-xl border border-white/5 active:bg-zinc-800 transition-colors shadow-sm">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </Link>
        </div>

        {/* Middle: Logo */}
        <div className="flex-none flex items-center justify-center">
          <Link href="/gf" className="block h-[45px] w-auto">
            <img 
              src="/gf_logo.jpg" 
              alt="AI Girlfriend Logo" 
              className="h-full w-auto object-contain pointer-events-none"
            />
          </Link>
        </div>

        {/* Right: Hamburger Menu */}
        <div className="flex-1 flex justify-end">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="bg-[#141414] w-[45px] h-[45px] flex items-center justify-center rounded-xl border border-white/5 active:bg-zinc-800 transition-colors shadow-sm"
            aria-label="Abrir menú"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
        
      </header>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}