import { supabase } from '@/lib/supabase';
import ThumbCard from '@/components/ThumbCard';
import Link from 'next/link';

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
      <div className="p-4 bg-[#211d1d]">
        <h1 className="text-2xl font-bold text-white leading-tight mb-4">
          {video.title}
        </h1>
        
        <div className="w-full h-[1px] bg-white/10 mb-4" />

        <div className="flex flex-wrap items-center">
          {video.video_categories?.map((vc: any, index: number) => (
            <span key={vc.categories.id} className="flex items-center">
              <Link href={`/category/${vc.categories.id}`} className="no-underline">
                <span 
                  className="text-sm font-medium capitalize"
                  style={{ color: 'white' }}
                >
                  {vc.categories.name}
                </span>
              </Link>
              {index < (video.video_categories.length - 1) && (
                <span className="text-white mr-1.5">,</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Banner Section */}
      <div className="w-full py-4 bg-black">
        <Link href="#" className="block">
          <img 
            src="https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/banners/maya.jpg" 
            alt="Publicidad" 
            className="w-full h-auto object-contain"
          />
        </Link>
      </div>

      {/* Related Videos Section */}
      <div className="flex flex-col bg-black pb-10">
        <div className="px-4 py-2">
          <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">
            Videos Relacionados
          </h2>
        </div>
        
        <div className="flex flex-col">
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