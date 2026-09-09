process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://riiifantmxoywjlqngcg.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaWlmYW50bXhveXdqbHFuZ2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTIxNDksImV4cCI6MjEwNDUyODE0OX0.5cQ-IxMgguIbhU42kGMUuh3ZL8gDFvsfs_4pLucuaoE';

async function checkDB() {
  const { supabase } = await import('../lib/supabase-client');
  const { data: products } = await supabase.from('products').select('name, price, category_id, collection, fabric, tags');
  console.log('Total Products in DB:', products?.length);
  console.log('Sample Products:', products);
}

checkDB();
