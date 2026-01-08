// components/video/CloudflarePlayer.tsx
'use client';

import { useEffect, useRef } from 'react';

interface CloudflarePlayerProps {
  videoUid: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
}

export default function CloudflarePlayer({
  videoUid,
  autoplay = false,
  muted = false,
  controls = true,
  preload = 'metadata',
  poster,
}: CloudflarePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!playerRef.current) return;
    
    const script = document.createElement('script');
    script.src = 'https://embed.cloudflarestream.com/embed/sdk.latest.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  const iframeSrc = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoUid}/iframe?preload=${preload}${poster ? `&poster=${encodeURIComponent(poster)}` : ''}&autoplay=${autoplay}&muted=${muted}`;
  
  return (
    <div ref={playerRef} style={{ position: 'relative', paddingTop: '56.25%' }}>
      <iframe
        src={iframeSrc}
        loading="lazy"
        style={{
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
        }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
}