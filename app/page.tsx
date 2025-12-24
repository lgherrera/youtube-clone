import { supabase } from "@/lib/supabase";
import Slider from "@/components/Slider";
import ThumbCard from "@/components/ThumbCard";

export default async function Home() {
  // Parallel queries with category joins
  const [{ data: recentVideos }, { data: allVideos }] = await Promise.all([
    // Get the last 4 videos for the slider
    supabase
      .from("videos")
      .select(`
        id,
        title,
        thumbnail_url,
        slider_url,
        created_at,
        video_categories(
          categories(name)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(4),
    // Get all videos for the feed
    supabase
      .from("videos")
      .select(`
        id,
        title,
        thumbnail_url,
        created_at,
        video_categories(
          categories(name)
        )
      `)
      .order("created_at", { ascending: false })
  ]);

  // Transform the data to flatten categories
  const transformVideos = (videos: any[] | null) => {
    return videos?.map(video => ({
      ...video,
      categories: video.video_categories?.map((vc: any) => vc.categories?.name).filter(Boolean) || []
    }));
  };

  const transformedSlider = transformVideos(recentVideos);
  const transformedAll = transformVideos(allVideos);

  return (
    <div className="min-h-screen bg-black">
      {/* Slider with last 4 videos */}
      {transformedSlider && transformedSlider.length > 0 && (
        <Slider videos={transformedSlider} />
      )}

      {/* Video Feed */}
      <section className="flex flex-col w-full pb-20">
        {transformedAll?.map((video) => (
          <ThumbCard key={video.id} video={video} />
        ))}
      </section>
    </div>
  );
}
