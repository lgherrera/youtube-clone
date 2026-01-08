// app/(main)/video/[id]/page.tsx
import { supabase } from "@/lib/supabase";
import { notFound } from 'next/navigation';
import CloudflarePlayer from '@/components/video/CloudflarePlayer';
import ThumbCard from '@/components/ThumbCard';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  
  // Fetch the main video with categories
  const { data: video, error } = await supabase
    .from('videos')
    .select(`
      *,
      video_categories (
        categories (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single();
  
  if (error || !video) {
    notFound();
  }
  
  // Format categories
  const categories = video.video_categories?.map((vc: any) => vc.categories) || [];
  const videoWithCategories = { ...video, categories };
  
  // Fetch related videos (same categories, excluding current video)
  const categoryIds = categories.map((c: any) => c.id);
  let relatedVideos: any[] = [];
  
  if (categoryIds.length > 0) {
    const { data } = await supabase
      .from('videos')
      .select(`
        *,
        video_categories!inner (
          categories (
            id,
            name
          )
        )
      `)
      .in('video_categories.category_id', categoryIds)
      .neq('id', id)
      .limit(8);
    
    if (data) {
      relatedVideos = data.map((v: any) => ({
        ...v,
        categories: v.video_categories?.map((vc: any) => vc.categories) || []
      }));
    }
  }
  
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Video Player */}
      <div style={{ marginBottom: '30px' }}>
        <CloudflarePlayer
          videoUid={video.cloudflare_uid}
          poster={video.thumbnail_url || video.cloudflare_thumbnail_url}
          controls={true}
          preload="metadata"
        />
      </div>
      
      {/* Video Info */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px' }}>
          {video.title}
        </h1>
        
        {video.description && (
          <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.6' }}>
            {video.description}
          </p>
        )}
        
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#888' }}>
          {video.duration_seconds && (
            <span>Duration: {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}</span>
          )}
          {video.created_at && (
            <span>Uploaded: {new Date(video.created_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      
      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            Related Videos
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {relatedVideos.map((relatedVideo) => (
              <ThumbCard key={relatedVideo.id} video={relatedVideo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}