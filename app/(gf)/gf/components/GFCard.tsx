// app/(gf)/gf/components/GFCard.tsx
import Image from 'next/image';
import styles from './GFCard.module.css';

interface GFCardProps {
  id: string;
  name: string;
  age: number;
  description: string;
  image_url: string;
  onClick?: () => void;
}

export default function GFCard({ 
  id, 
  name, 
  age, 
  description, 
  image_url,
  onClick 
}: GFCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageContainer}>
        <Image
          src={image_url}
          alt={`${name}, ${age}`}
          fill
          sizes="(max-width: 500px) 100vw, 500px"
          className={styles.image}
          priority
        />
      </div>
      
      <div className={styles.content}>
        <h2 className={styles.title}>{name}, {age}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}