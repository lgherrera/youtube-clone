import { supabase } from '@/lib/supabase';
import ThumbCard from '@/components/ThumbCard';

export default async function CategoryFilterPage({
  params,
}: {
  params: { id: string };
}) {
  // 1. Await params for Next.js 15+ compatibility
  const { id } = await params;

  // 2. Fetch the current category name for the header
  const { data: categoryData } = await supabase
    .from('categories')
    .select('name')
    .eq('id', id)
    .single();

  // 3. Fetch videos linked to this ID via the junction table
  const { data: videoLinks, error } = await supabase
    .from('video_categories')
    .select(`
      videos!inner (
        id,
        title,
        thumbnail_url,
        video_categories (
          categories (
            id,
            name
          )
        )
      )
    `)
    .eq('category_id', id);

  if (error) {
    console.error('Supabase Error:', error.message);
    return <div className="p-4 text-white">Error loading videos for this category.</div>;
  }

  // 4. Flatten the nested Supabase response
  const videos = videoLinks
    ?.map((link: any) => link.videos)
    .filter((v: any) => v !== null) || [];

  return (
    <main className="flex flex-col bg-black min-h-screen">
      {/* Dynamic Header showing the Category Name */}
      <div className="p-4 border-b border-zinc-900 bg-[#141414]">
        <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">
          Explorando: {categoryData?.name || 'Categoría'}
        </h1>
      </div>

      {/* Filtered Video Feed */}
      <div className="flex flex-col">
        {videos.length > 0 ? (
          videos.map((video: any) => (
            <ThumbCard 
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnail_url}
              // Pass IDs so users can click other tags within this view
              categories={video.video_categories?.map((vc: any) => vc.categories)}
            />
          ))
        ) : (
          <div className="p-12 text-center text-zinc-600 uppercase text-xs font-bold tracking-widest">
            No hay videos disponibles
          </div>
        )}
      </div>
    </main>
  );
}