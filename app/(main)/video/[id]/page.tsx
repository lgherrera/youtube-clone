// app/(main)/video/[id]/page.tsx
import { supabase } from "@/lib/supabase";
import { notFound } from 'next/navigation';
import CloudflarePlayer from '@/components/video/CloudflarePlayer';
import ThumbCard from '@/components/ThumbCard';
import styles from './videoPage.module.css';

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
    // First, get video IDs that share any of these categories
    const { data: relatedVideoIds } = await supabase
      .from('video_categories')
      .select('video_id')
      .in('category_id', categoryIds)
      .neq('video_id', id);
    
    if (relatedVideoIds && relatedVideoIds.length > 0) {
      // Get unique video IDs
      const uniqueVideoIds = [...new Set(relatedVideoIds.map(v => v.video_id))];
      
      // Fetch the actual videos with their categories
      const { data } = await supabase
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
        .in('id', uniqueVideoIds)
        .limit(8);
      
      if (data) {
        relatedVideos = data.map((v: any) => ({
          ...v,
          categories: v.video_categories?.map((vc: any) => vc.categories) || []
        }));
      }
    }
  }
  
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Video Title */}
      <h1 className={styles.title} style={{ marginBottom: '15px' }}>
        {video.title}
      </h1>
      
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
        {video.description && (
          <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.6' }}>
            {video.description}
          </p>
        )}
        
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#888' }}>
          {video.duration_seconds && (
            <span>Duration: {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}</span>
          )}
        </div>
      </div>
      
      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px' }}>
            Related Videos
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '0px' 
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