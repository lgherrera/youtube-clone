import { supabase } from "@/lib/supabase";
import ThumbCard from "@/components/ThumbCard";
import Header from "@/components/Header";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: {
    id: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = params;

  // 1. Fetch videos filtered by the specific category
  // We fetch the full row to provide the complete video object to ThumbCard
  const { data: videos, error } = await supabase
    .from("videos")
    .select("*")
    .contains("categories", [id])
    .order("created_at", { ascending: false });

  if (error || !videos) {
    console.error("Error fetching category videos:", error);
    return notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      {/* 2. Category Title Header */}
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold capitalize">
          {id.replace(/-/g, ' ')}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'} encontrados
        </p>
      </div>

      {/* 3. Responsive Video Grid */}
      <div className="flex flex-col gap-2">
        {videos.map((video) => (
          /* FIX: We pass the entire 'video' object instead of individual props.
             This satisfies the ThumbCardProps interface and fixes the build error.
            
          */
          <ThumbCard 
            key={video.id} 
            video={video} 
          />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="text-zinc-500">No hay videos en esta categoría todavía.</p>
        </div>
      )}
    </main>
  );
}