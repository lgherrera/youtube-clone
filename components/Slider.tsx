"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface SliderProps {
  videos: {
    id: string;
    thumbnail_url: string;
    slider_url?: string;
    title: string;
  }[];
}

export default function Slider({ videos }: SliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || videos.length <= 1) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const cardWidth = container.offsetWidth * 0.9;
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (currentScroll >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [videos]);

  if (!videos || videos.length === 0) return null;

  return (
    <div className="w-full bg-black pb-6 pt-2">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 px-4"
      >
        {videos.map((video) => (
          <div key={video.id} className="min-w-[90%] snap-center">
            <Link href={`/video/${video.id}`} className="block relative group">
              {/* Maintain 16:9 aspect ratio for the thumbnails */}
              <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <img 
                  src={video.slider_url || video.thumbnail_url} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* REMOVED: Title text overlay
                  KEPT: Gradient and Badge for visual depth 
                */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5">
                  <div className="flex items-center gap-2">
                    <span className="bg-pink-600 text-[10px] text-white font-bold px-2 py-0.5 rounded-sm uppercase">
                      Destacado
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}