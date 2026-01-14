// components/ThumbCard.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./ThumbCard.module.css";

export default function ThumbCard({ video }: { video: any }) {
  // Use custom thumbnail if available, fallback to Cloudflare auto-generated
  const displayThumbnail = video.thumbnail_url || video.cloudflare_thumbnail_url || '/placeholder.jpg';
  
  // Format duration (seconds to MM:SS)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={styles.card}>
      {/* Thumbnail */}
      <Link href={`/video/${video.id}`} className={styles.thumbnailLink}>
        <div className={styles.thumbnailContainer}>
          <img 
            src={displayThumbnail}
            alt={video.title}
            className={styles.thumbnail}
            loading="lazy"
          />
          
          {/* CSS Play Button */}
          <div className={styles.playButton}>
            <div className={styles.playTriangle}></div>
          </div>
          
          {/* Duration badge */}
          {video.duration_seconds && (
            <span className={styles.duration}>
              {formatDuration(video.duration_seconds)}
            </span>
          )}
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