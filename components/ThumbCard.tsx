"use client";

import Link from "next/link";

export default function ThumbCard({ video }: { video: any }) {
  return (
    <div className="flex flex-col w-full bg-black mb-8">
      {/* Thumbnail - 16:9 ratio, full width */}
      <Link href={`/video/${video.id}`} className="block relative group">
        <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 transition-all duration-200 group-hover:border-white/15">
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Text Container - using margin for indentation */}
      <div className="mt-5 ml-6 mr-6 flex flex-col gap-1">
        <Link href={`/video/${video.id}`} className="no-underline group">
          <h3 className="text-white font-normal text-lg leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-zinc-300">
            {video.title}
          </h3>
        </Link>

        {/* Categories - Separated by commas */}
        {video.categories?.length > 0 && (
          <div className="text-zinc-400 text-xs capitalize">
            {video.categories.map((cat: string, index: number) => (
              <span key={index}>
                {cat}
                {index < video.categories.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}