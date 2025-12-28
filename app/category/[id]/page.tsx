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

  // Try multiple lookup strategies
  // 1. Direct ID or slug match
  let { data: category } = await supabase
    .from("categories")
    .select("*")
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  // 2. If not found, try case-insensitive name match
  if (!category) {
    const nameToMatch = id.replace(/-/g, ' ');
    const { data: categoryByName } = await supabase
      .from("categories")
      .select("*")
      .ilike('name', nameToMatch)
      .single();
    
    category = categoryByName;
  }

  // 3. If still not found, try partial match
  if (!category) {
    const searchTerm = id.replace(/-/g, ' ');
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .ilike('name', `%${searchTerm}%`)
      .limit(1);
    
    if (categories && categories.length > 0) {
      category = categories[0];
    }
  }

  if (!category) {
    return (
      <div className={styles.container}>
        <h1>Categoría no encontrada</h1>
      </div>
    );
  }

  // Fetch videos for this category
  const { data: videoLinks } = await supabase
    .from("video_categories")
    .select(`
      videos (
        id,
        title,
        thumbnail_url,
        created_at,
        video_categories(
          categories(name)
        )
      )
    `)
    .eq("category_id", category.id);

  // Transform to match home page format
  const videos = videoLinks
    ?.map((link: any) => link.videos)
    .filter((v: any) => v && v.id)
    .map((video: any) => ({
      ...video,
      categories: video.video_categories?.map((vc: any) => vc.categories?.name).filter(Boolean) || []
    })) || [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{category.name}</h1>
      
      {videos && videos.length > 0 ? (
        <div className={styles.grid}>
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