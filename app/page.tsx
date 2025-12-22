import { supabase } from '@/lib/supabase';
import ThumbCard from '@/components/ThumbCard';

export default async function Home() {
  // 1. Fetch videos and join categories, ensuring we include the category ID
  const { data: videos, error } = await supabase
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

  if (error) {
    console.error('Error fetching videos:', error);
    return (
      <div className="p-4 text-white bg-black min-h-screen">
        Error loading content. Please check your database connection.
      </div>
    );
  }

  return (
    <main className="flex flex-col bg-black min-h-screen">
      <div className="flex flex-col">
        {videos?.map((video) => (
          <div key={video.id}>
            {/* Passing the full category object (id and name) 
              so the ThumbCard can create clickable links
            */}
            <ThumbCard 
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnail_url}
              categories={video.video_categories?.map((vc: any) => vc.categories)}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
