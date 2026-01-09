// app/category/[id]/page.tsx

import { supabase } from '@/lib/supabase';
import ThumbCard from "@/components/ThumbCard";
import styles from "./page.module.css";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch all categories and find match with case-insensitive comparison
  const { data: categories, error: fetchError } = await supabase
    .from("categories")
    .select("*");

  if (fetchError) {
    console.error("Category fetch error:", fetchError);
    return (
      <div className={styles.container}>
        <h1>Error al cargar categorías</h1>
      </div>
    );
  }

  // Find category with case-insensitive ID match
  const category = categories?.find(
    (cat) => cat.id.toLowerCase() === id.toLowerCase()
  );

  if (!category) {
    console.error("Category not found. Looking for:", id, "Available:", categories?.map(c => c.id));
    return (
      <div className={styles.container}>
        <h1>Categoría no encontrada</h1>
        <p>ID buscado: {id}</p>
      </div>
    );
  }

  // Fetch videos for this category with category IDs and names
  const { data: videoLinks } = await supabase
    .from("video_categories")
    .select(`
      videos (
        id,
        title,
        thumbnail_url,
        created_at,
        video_categories(
          categories(id, name)
        )
      )
    `)
    .eq("category_id", category.id);

  // Transform to match home page format with category objects
  const videos = videoLinks
    ?.map((link: any) => link.videos)
    .filter((v: any) => v && v.id)
    .map((video: any) => ({
      ...video,
      categories: video.video_categories?.map((vc: any) => ({
        id: vc.categories?.id,
        name: vc.categories?.name
      })).filter((cat: any) => cat.id && cat.name) || []
    })) || [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{category.name}</h1>
      
      {videos && videos.length > 0 ? (
        <div className={styles.singleColumn}>
          {videos.map((video) => (
            <ThumbCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <p className={styles.noVideos}>No hay videos en esta categoría.</p>
      )}
    </div>
  );
}