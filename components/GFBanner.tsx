import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './GFBanner.module.css';

export default async function GFBanner() {
  // Fetch all active banners
  const { data: banners, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true);

  if (error || !banners || banners.length === 0) {
    console.error('Error fetching banners:', error);
    return null; // Don't show anything if no banners available
  }

  // Select a random banner
  const randomBanner = banners[Math.floor(Math.random() * banners.length)];

  return (
    <div className={styles.bannerContainer}>
      <Link href={randomBanner.href} target="_blank" rel="noopener noreferrer">
        <div className={styles.bannerWrapper}>
          <img 
            src={randomBanner.image_url} 
            alt={randomBanner.alt_text} 
            className={styles.bannerImage}
          />
        </div>
      </Link>
    </div>
  );
}