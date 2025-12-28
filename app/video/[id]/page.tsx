//app/video/[id]/page.tsx
import { supabase } from '@/lib/supabase';
import ThumbCard from '@/components/ThumbCard';
import GFBanner from '@/components/GFBanner';
import Link from 'next/link';
import Image from 'next/image';
import styles from './videoPage.module.css';
import relatedStyles from './relatedVideos.module.css';

export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // 1. Fetch current video details and categories
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
    return <div className="p-10 text-white text-center">Video no encontrado.</div>;
  }

  // 2. Fetch Related Videos (same categories)
  const categoryIds = video.video_categories?.map((vc: any) => vc.categories.id) || [];
  
  const { data: relatedData } = await supabase
    .from('video_categories')
    .select(`
      videos (
        id,
        title,
        thumbnail_url,
        video_categories (
          categories (id, name)
        )
      )
    `)
    .in('category_id', categoryIds)
    .limit(10);

  // Filter out the current video and transform for ThumbCard
  const relatedVideos = relatedData
    ?.map((link: any) => link.videos)
    .filter((v: any) => v && v.id !== id)
    .map((rv: any) => ({
      id: rv.id,
      title: rv.title,
      thumbnail_url: rv.thumbnail_url,
      categories: rv.video_categories?.map((vc: any) => vc.categories?.name).filter(Boolean) || []
    })) || [];

  return (
    <main className="flex flex-col bg-black min-h-screen">
      {/* Video Player Section */}
      <div className="w-full aspect-video bg-zinc-900">
        <video 
          src={video.video_url} 
          controls 
          className="w-full h-full"
          poster={video.thumbnail_url}
        />
      </div>

      {/* Info Section (#211d1d) */}
      <div className={styles.infoSection}>
        {/* Title - matching ThumbCard exact styling */}
        <h1 className={styles.title}>
          {video.title}
        </h1>
        
        {/* Categories and Heart Icon Container - matching ThumbCard */}
        <div className={styles.categoryContainer}>
          {/* Heart Icon - positioned to the LEFT */}
          <button className={styles.heartButton}>
            <Image
              src="/heart.svg"
              alt="Like"
              width={20}
              height={20}
              className={styles.heartIcon}
            />
          </button>

          <div className={styles.categories}>
            {video.video_categories?.map((vc: any, index: number) => (
              <div key={vc.categories.id} className={styles.categoryItem}>
                <Link href={`/category/${vc.categories.id}`} className={styles.categoryLink}>
                  <span className={styles.category}>
                    {vc.categories.name}
                  </span>
                </Link>
                {index < (video.video_categories.length - 1) && (
                  <span className={styles.comma}>, </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Section - fetches random banner automatically */}
      <GFBanner />

      {/* Related Videos Section */}
      <div className={relatedStyles.section}>
        <div className={relatedStyles.headingContainer}>
          <h2 className={relatedStyles.heading}>
            Videos Relacionados
          </h2>
        </div>
        
        <div className={relatedStyles.videosContainer}>
          {relatedVideos.map((video) => (
            <ThumbCard 
              key={video.id}
              video={video}
            />
          ))}
        </div>
      </div>
    </main>
  );
}