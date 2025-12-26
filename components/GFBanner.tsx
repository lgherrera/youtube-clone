import Link from 'next/link';
import styles from './GFBanner.module.css';

interface GFBannerProps {
  imageUrl: string;
  alt?: string;
  href?: string;
  className?: string;
}

export default function GFBanner({ 
  imageUrl, 
  alt = "Publicidad", 
  href = "#",
  className = ""
}: GFBannerProps) {
  return (
    <div className={`${styles.bannerContainer} ${className}`}>
      <Link href={href}>
        <div className={styles.bannerWrapper}>
          <img 
            src={imageUrl} 
            alt={alt} 
            className={styles.bannerImage}
          />
        </div>
      </Link>
    </div>
  );
}