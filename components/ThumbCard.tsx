// components/ThumbCard.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./ThumbCard.module.css";

export default function ThumbCard({ video }: { video: any }) {
  return (
    <div className={styles.card}>
      {/* Thumbnail */}
      <Link href={`/video/${video.id}`} className={styles.thumbnailLink}>
        <div className={styles.thumbnailContainer}>
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className={styles.thumbnail}
            loading="lazy"
          />
        </div>
      </Link>

      {/* Text Container */}
      <div className={styles.textContainer}>
        <Link href={`/video/${video.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>
            {video.title}
          </h3>
        </Link>

        {/* Categories with heart icons */}
        {video.categories?.length > 0 && (
          <div className={styles.categories}>
            {video.categories.map((category: any, index: number) => {
              return (
                <span key={category.id} className={styles.categoryWrapper}>
                  <Link 
                    href={`/category/${category.id}`}
                    className={styles.categoryItem}
                  >
                    <Image 
                      src="/heart.svg" 
                      alt="heart" 
                      width={20}
                      height={20}
                      className={styles.heartIcon}
                    />
                    {category.name}
                  </Link>
                  {index < video.categories.length - 1 && <span className={styles.separator}>, </span>}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}