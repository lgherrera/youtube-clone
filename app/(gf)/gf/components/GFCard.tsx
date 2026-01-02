// app/(gf)/gf/components/GFCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from './GFCard.module.css';

interface GFCardProps {
  id: string;
  slug: string; // Added this so we can link to /gf/[slug]/chat
  name: string;
  age: number;
  description: string;
  image_url: string;
}

export default function GFCard({ 
  id, 
  slug,
  name, 
  age, 
  description, 
  image_url
}: GFCardProps) {
  
  // Construct the dynamic URL for the chat page
  const chatUrl = `/gf/${slug}/chat`;

  return (
    <div className={styles.card}>
      
      {/* 1. Wrap the Image Container in a Link */}
      {/* We pass the existing style class to the Link so layout stays the same */}
      <Link href={chatUrl} className={styles.imageContainer}>
        <Image
          src={image_url}
          alt={`${name}, ${age}`}
          fill
          sizes="(max-width: 500px) 100vw, 500px"
          className={styles.image}
          priority
        />
      </Link>
      
      <div className={styles.content}>
        {/* 2. Wrap the Title in a Link */}
        <Link href={chatUrl} style={{ textDecoration: 'none' }}>
          <h2 className={styles.title}>{name}, {age}</h2>
        </Link>
        
        {/* Description remains unlinked text */}
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}