import { Menu, LayoutList } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="h-[65px] w-full flex items-center justify-between px-4 sticky top-0 bg-black z-[100] border-b border-zinc-900">
      
      {/* 1. Left: Hamburger Menu */}
      <div className="flex-1 flex justify-start">
        <button className="bg-[#141414] w-[45px] h-[45px] flex items-center justify-center rounded-xl border border-white/5 active:bg-zinc-800 transition-colors shadow-sm">
          <Menu 
            size={28} 
            strokeWidth={2.5} 
            style={{ stroke: 'white' }} 
          /> 
        </button>
      </div>

      {/* 2. Middle: New Wide Logo */}
      <div className="flex-none flex items-center justify-center">
        <Link href="/" className="block h-[45px] w-auto">
          <img 
            src="/stv_logo.jpg" 
            alt="SEXOTV Logo" 
            className="h-full w-auto object-contain pointer-events-none"
          />
        </Link>
      </div>

      {/* 3. Right: Yellow List Icon */}
      <div className="flex-1 flex justify-end">
        <Link href="/categories">
          <button className="bg-[#141414] w-[45px] h-[45px] flex items-center justify-center rounded-xl border border-white/5 active:bg-zinc-800 transition-colors shadow-sm">
            <LayoutList 
              size={24} 
              strokeWidth={2.5} 
              style={{ stroke: '#FFB800' }} 
            />
          </button>
        </Link>
      </div>
      
    </header>
  );
}