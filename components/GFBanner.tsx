// components/GFBanner.tsx
import Link from 'next/link';

interface GFBannerProps {
  imageUrl: string;
  alt?: string;
  href?: string;
  className?: string;
}

export default function GFBanner({ 
  imageUrl, 
  alt = "Publicidad", 
  href = "#",
  className = ""
}: GFBannerProps) {
  return (
    <div className={`w-full py-4 bg-black px-4 ${className}`}>
      <Link href={href} className="block">
        <div className="border-2 border-white/60 rounded-sm overflow-hidden">
          <img 
            src={imageUrl} 
            alt={alt} 
            className="w-full h-auto object-contain"
          />
        </div>
      </Link>
    </div>
  );
}