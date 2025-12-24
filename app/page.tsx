import { supabase } from '@/lib/supabase';
import ThumbCard from '@/components/ThumbCard';
import Slider from '@/components/Slider'; // Import the new slider

export default async function Home() {
  // 1. Fetch the 4 most recent videos for the Slider
  const { data: sliderVideos } = await supabase
    .from('videos')
    .select('id, title, slider_url')
    .order('created_at', { ascending: false })
    .limit(4);

  // 2. Fetch the standard feed
  const { data: videos, error } = await supabase
    .from('videos')
    .select(`
      id, title, thumbnail_url,
      video_categories (categories (id, name))
    `)
    .order('created_at', { ascending: false });

  if (error) return <div className="p-4 text-white">Error loading content.</div>;

  return (
    <main className="flex flex-col bg-black min-h-screen">
      {/* 4. Insert Slider just below Header */}
      {sliderVideos && <Slider videos={sliderVideos} />}

      <div className="flex flex-col">
        {videos?.map((video) => (
          <ThumbCard 
            key={video.id}
            id={video.id}
            title={video.title}
            thumbnail={video.thumbnail_url}
            categories={video.video_categories?.map((vc: any) => vc.categories)}
          />
        ))}
      </div>
    </main>
  );
}
