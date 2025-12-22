import Link from 'next/link';

interface ThumbCardProps {
  id: string;
  title: string;
  thumbnail: string;
  // We must receive both ID and Name
  categories?: { id: string; name: string }[];
}

export default function ThumbCard({ 
  id, 
  title, 
  thumbnail, 
  categories 
}: ThumbCardProps) {
  return (
    <div className="w-full bg-[#211d1d] overflow-hidden border-b border-zinc-800/50 relative">
      {/* 1. Main Video Link (Wraps only the image and title) */}
      <Link href={`/video/${id}`} className="block group no-underline">
        <div className="relative aspect-[16/9] w-full bg-[#1a1a1a]">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 pb-1">
          <h3 
            className="text-[17px] font-bold leading-tight mb-2 transition-opacity group-hover:opacity-70"
            style={{ color: 'white' }}
          >
            {title}
          </h3>
        </div>
      </Link>

      {/* 2. Independent Category Links (Must be outside the main Link tag) */}
      <div className="px-4 pb-4 flex flex-wrap items-center gap-x-2 gap-y-1 relative z-10">
        {categories?.map((cat, index) => (
          <Link 
            key={index} 
            href={`/category/${cat.id}`} 
            className="no-underline hover:opacity-60 transition-opacity"
          >
            <span 
              className="text-[11px] font-bold uppercase tracking-tighter inline-block py-1"
              style={{ color: 'white' }} 
            >
              • {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}