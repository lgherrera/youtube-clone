const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkData() {
  const { data, error } = await supabase
    .from('girlfriends')
    .select('*');
  
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

checkData();
