// app/(gf)/gf/[slug]/chat/page.tsx
import { supabase } from '@/lib/supabase';
import ChatScreen from './ChatScreen';
import { notFound } from 'next/navigation';

// Define params as a Promise
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  // 1. Await params to fix the "params is a Promise" error
  const { slug } = await params;

  // 2. Use the unwrapped slug for the query
  const { data: gf, error } = await supabase
    .from('girlfriends')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (error || !gf) {
    return notFound();
  }

  return <ChatScreen name={gf.name} slug={gf.slug} />;
}