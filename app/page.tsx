import { supabase } from '@/lib/supabase';
import ThumbCard from '@/components/ThumbCard';
import Slider from '@/components/Slider';

export default async function Home() {
  // 1. Fetch the 4 most recent videos for the Slider
  // We include thumbnail_url to fix the TypeScript 'Property missing' error
  const { data: sliderVideos, error: sliderError } = await supabase
    .from('videos')
    .select('id, title, slider_url, thumbnail_url')
    .order('created_at', { ascending: false })
    .limit(4);

  // 2. Fetch the standard feed with full category joins
  const { data: videos, error: feedError } = await supabase
    .from('videos')
    .select(`
      id, 
      title, 
      thumbnail_url,
      video_categories (
        categories (
          id, 
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  // Handle potential database connection errors
  if (sliderError || feedError) {
    console.error('Database Error:', sliderError || feedError);
    return (
      <div className="p-10 text-white bg-black min-h-screen text-center uppercase text-xs font-bold tracking-widest">
        Error al cargar contenido
      </div>
    );
  }

  return (
    <main className="flex flex-col bg-black min-h-screen">
      {/* 3. The Auto-Scrolling Slider (16:9) */}
      {sliderVideos && sliderVideos.length > 0 && (
        <Slider videos={sliderVideos as any} />
      )}

      {/* 4. The Main Video Feed */}
      <div className="flex flex-col">
        {videos?.map((video) => (
          <div key={video.id}>
            <ThumbCard 
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnail_url}
              // Map the junction table to provide the ID and Name for clickable tags
              categories={video.video_categories?.map((vc: any) => vc.categories)}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
