import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function CategoriesPage() {
  // 1. Fetch all categories from the 'categories' table
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return <div className="p-4 text-white">Error loading categories.</div>;
  }

  return (
    <main className="min-h-screen bg-black p-4">
      {/* Page Title */}
      <h1 className="text-2xl font-black text-white uppercase italic mb-6 tracking-tighter">
        Categorías
      </h1>

      {/* 2. Two-Column Grid for Categories */}
      <div className="grid grid-cols-2 gap-3">
        {categories?.map((category) => (
          <Link 
            key={category.id} 
            href={`/category/${category.id}`}
            className="group"
          >
            <div className="bg-[#211d1d] h-[100px] flex items-center justify-center rounded-xl border border-white/5 active:scale-95 transition-all group-hover:bg-zinc-800 shadow-lg">
              <span 
                className="text-white font-bold uppercase text-sm tracking-widest text-center px-2"
                style={{ color: 'white' }} // Defeating purple text
              >
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}