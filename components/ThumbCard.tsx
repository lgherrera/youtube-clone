"use client";

import Link from "next/link";

interface Video {
  id: string;
  thumbnail_url: string;
  title: string;
  categories: string[];
}

interface ThumbCardProps {
  video: Video;
}

export default function ThumbCard({ video }: ThumbCardProps) {
  return (
    <div className="flex flex-col w-full bg-black">
      {/* 1. Thumbnail Area with 16:9 Aspect Ratio */}
      <Link href={`/video/${video.id}`} className="block relative px-4">
        <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </Link>

      {/* 2. Text Content with 24px Padding (p-6) */}
      <div className="p-6 flex flex-col gap-1.5">
        
        {/* Video Title - Bold and High Contrast */}
        <Link href={`/video/${video.id}`}>
          <h3 className="text-zinc-100 font-bold text-base leading-tight line-clamp-2 active:text-pink-500 transition-colors">
            {video.title}
          </h3>
        </Link>

        {/* Categories - Lowercase and Subtle */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {video.categories && video.categories.map((cat, index) => (
            <span 
              key={`${video.id}-${index}`} 
              className="text-zinc-500 text-xs lowercase font-medium"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}