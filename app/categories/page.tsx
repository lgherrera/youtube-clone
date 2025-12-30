// app/categories/page.tsx
import { supabase } from "@/lib/supabase";
import CategoryCard from "@/components/CategoryCard";
import GFBanner from "@/components/GFBanner";
import styles from "./Categories.module.css";

export const metadata = {
  title: "Categorías - SEXOTV",
  description: "Explora todas las categorías disponibles",
};

export default async function CategoriesPage() {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, thumbnail_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p className={styles.errorText}>Error al cargar categorías</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* GFBanner at the top - right below header component */}
      <GFBanner />

      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Categorías</h1>
        <p className={styles.subtitle}>
          {categories?.length || 0} {categories?.length === 1 ? 'categoría' : 'categorías'} disponibles
        </p>
      </div>

      {/* Two-column grid */}
      <div className={styles.gridContainer}>
        <div className={styles.categoriesGrid}>
          {categories?.map((category, index) => (
            <CategoryCard 
              key={category.id} 
              category={category}
              priority={index < 2} // First 2 images load with priority
            />
          ))}
        </div>
      </div>

      {/* Empty state */}
      {(!categories || categories.length === 0) && (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No hay categorías disponibles todavía.</p>
        </div>
      )}
    </div>
  );
}