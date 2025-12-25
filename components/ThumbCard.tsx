"use client";

import Link from "next/link";
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

        {/* Categories */}
        {video.categories?.length > 0 && (
          <div className={styles.categories}>
            {video.categories.map((cat: string, index: number) => (
              <span key={index}>
                {cat}
                {index < video.categories.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}