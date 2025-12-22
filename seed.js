// 1. Setup - Replace with your actual Supabase credentials

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://awmewvzgyaylxmxsptcz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bWV3dnpneWF5bHhteHNwdGN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM0NDc0NywiZXhwIjoyMDgxOTIwNzQ3fQ.KPHXJ4A8u86tcrkmmjuFQoKQK_bs4nLMQ5GJVOkIAGY'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedDatabase() {
  console.log('🚀 Fetching existing categories and seeding videos...');

  // 2. Fetch the IDs of the categories you already created
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .in('name', ['Interracial', 'Pene Gigante', 'Trio', 'Morenaza']);

  if (catError || !categories || categories.length === 0) {
    return console.error('Error: Could not find your categories in the database.', catError);
  }

  // Create a helper map to easily get IDs by name
  const catMap = {};
  categories.forEach(c => { catMap[c.name] = c.id; });

  // 3. Insert 5 Videos (768x432 thumbnails)
  const videoData = [
    {
      title: 'Morena Disfrutando Doble',
      thumbnail_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_001.jpg',
      video_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_001.mp4'
    },
    {
      title: 'Morena Disfrutando Doble',
      thumbnail_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_002.jpg',
      video_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_001.mp4'
    },
    {
      title: 'Morena Disfrutando Doble',
      thumbnail_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_003.jpg',
      video_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_001.mp4'
    },
    {
      title: 'Morena Disfrutando Doble',
      thumbnail_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_004.jpg',
      video_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_001.mp4'
    },
    {
      title: 'Morena Disfrutando Doble',
      thumbnail_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_005.jpg',
      video_url: 'https://awmewvzgyaylxmxsptcz.supabase.co/storage/v1/object/public/media/cpa_001.mp4'
    }
  ];

  const { data: videos, error: vidError } = await supabase
    .from('videos')
    .insert(videoData)
    .select();

  if (vidError) return console.error('Error inserting videos:', vidError);

  // 4. Link Videos to your specific Categories (Many-to-Many)
  // We use the IDs we fetched in Step 2
  const links = [
    { video_id: videos[0].id, category_id: catMap['Trio'] },
    { video_id: videos[1].id, category_id: catMap['Morenaza'] },
    { video_id: videos[2].id, category_id: catMap['Interracial'] },
    { video_id: videos[3].id, category_id: catMap['Pene Gigante'] },
    
    // Video 5 belongs to BOTH Interracial and Morenaza
    { video_id: videos[4].id, category_id: catMap['Interracial'] },
    { video_id: videos[4].id, category_id: catMap['Morenaza'] }
  ];

  const { error: linkError } = await supabase
    .from('video_categories')
    .insert(links);

  if (linkError) console.error('Error linking categories:', linkError);

  console.log('✅ Successfully seeded 5 videos linked to your existing categories!');
}

seedDatabase();