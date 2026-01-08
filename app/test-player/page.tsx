// app/test-player/page.tsx
import { supabase } from "@/lib/supabase";
import CloudflarePlayer from '@/components/video/CloudflarePlayer';
import Link from 'next/link';

export default async function TestPlayerPage() {
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);
  
  if (!videos || videos.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>No videos found</h1>
        <p>Please add videos to your Supabase videos table</p>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px' }}>
        Test Cloudflare Player
      </h1>
      
      <div style={{ display: 'grid', gap: '40px' }}>
        {videos.map((video) => (
          <div key={video.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
              {video.title}
            </h2>
            
            <div style={{ marginBottom: '15px' }}>
              <CloudflarePlayer
                videoUid={video.cloudflare_uid}
                poster={video.thumbnail_url || video.cloudflare_thumbnail_url}
                controls={true}
                preload="metadata"
              />
            </div>
            
            {video.description && (
              <p style={{ color: '#666', marginBottom: '10px' }}>
                {video.description}
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#888' }}>
              <span>Video UID: {video.cloudflare_uid}</span>
              {video.duration_seconds && (
                <span>Duration: {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}</span>
              )}
            </div>
            
            <Link 
              href={`/video/${video.id}`}
              style={{ display: 'inline-block', marginTop: '15px', color: '#0070f3', textDecoration: 'underline' }}
            >
              View Full Page →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}