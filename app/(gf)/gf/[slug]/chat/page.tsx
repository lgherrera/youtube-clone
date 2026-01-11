// app/(gf)/gf/[slug]/chat/page.tsx
import Link from 'next/link';
import { supabase } from '../../../../../lib/supabase';
import { notFound } from 'next/navigation';
import styles from './chat.module.css';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ChatPage({ params }: Props) {
  const { slug } = await params;

  const { data: girlfriend, error } = await supabase
    .from('girlfriends')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (error || !girlfriend) {
    notFound();
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/gf" className={styles.iconButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>

        <h1 className={styles.headerTitle}>{girlfriend.name}</h1>

        <button className={styles.iconButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </header>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        <div className={styles.messageBubbleLeft}>
          Hi! I'm {girlfriend.name}. What's on your mind?
        </div>
      </div>

      {/* Input Footer */}
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Message"
          className={styles.inputField}
        />
        <button className={styles.sendButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}