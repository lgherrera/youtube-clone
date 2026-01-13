// app/(gf)/gf/[slug]/chat/page.tsx

import { supabase } from '../../../../../lib/supabase';
import { notFound } from 'next/navigation';
import ChatInterface from '../../components/ChatInterface';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ChatPage({ params }: Props) {
  const { slug } = await params;

  const { data: girlfriend, error } = await supabase
    .from('girlfriends')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !girlfriend) {
    notFound();
  }

  return <ChatInterface girlfriend={girlfriend} />;
}