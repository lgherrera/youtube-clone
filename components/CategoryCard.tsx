// components/CategoryCard.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./CategoryCard.module.css";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    thumbnail_url: string | null;
  };
  priority?: boolean;
}

export default function CategoryCard({ category, priority = false }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.id}`} className={styles.card}>
      {/* Thumbnail container with 16:9 aspect ratio */}
      <div className={styles.thumbnailContainer}>
        {category.thumbnail_url ? (
          <Image
            src={category.thumbnail_url}
            alt={category.name}
            fill
            className={styles.thumbnail}
            sizes="(max-width: 768px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className={styles.fallback}>
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {/* Category name below thumbnail */}
      <h3 className={styles.categoryName}>{category.name}</h3>
    </Link>
  );
}