// app/(gf)/gf/page.tsx
import { supabase } from '../../../lib/supabase';
import GFHeader from './components/GFHeader';
import GFCard from './components/GFCard';
import styles from './page.module.css';

export default async function GirlfriendPage() {
  const { data: girlfriends, error } = await supabase
    .from('girlfriends')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching girlfriends:', error);
  }

  return (
    <div className={styles.page}>
      <GFHeader />
      
      <main className={styles.main}>
        {girlfriends && girlfriends.length > 0 ? (
          <div className={styles.cardsContainer}>
            {girlfriends.map((gf) => (
              <GFCard
                key={gf.id}
                id={gf.id}
                name={gf.name}
                age={gf.age}
                description={gf.description}
                image_url={gf.image_url}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No AI girlfriends available at the moment.</p>
          </div>
        )}
      </main>
    </div>
  );
}