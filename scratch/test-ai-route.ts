process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://riiifantmxoywjlqngcg.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaWlmYW50bXhveXdqbHFuZ2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTIxNDksImV4cCI6MjEwNDUyODE0OX0.5cQ-IxMgguIbhU42kGMUuh3ZL8gDFvsfs_4pLucuaoE';

import { NextRequest } from 'next/server';

async function runTest(title: string, message: string, extra: any = {}) {
  const { POST } = await import('../app/api/ai/chat/route');
  console.log(`\n==================================================`);
  console.log(`TEST: ${title}`);
  console.log(`Prompt: "${message}"`);
  
  const req = new NextRequest('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, ...extra }),
  });

  const res = await POST(req);
  const json = await res.json();
  
  console.log(`Status: ${res.status}`);
  console.log(`AI Message: ${json.message}`);
  console.log(`Product IDs (${json.product_ids?.length || 0}):`, json.product_ids);
  if (json.suggested_questions) {
    console.log(`Suggested Questions:`, json.suggested_questions);
  }
}

async function main() {
  await runTest('A. Wedding outfit under 5000', 'I need something elegant for a wedding under ₹5,000.');
  await runTest('B. Black dresses under 2500', 'Show me black dresses under ₹2,500.');
  await runTest('C. Pastel outfits', 'Show me pastel outfits.');
  await runTest('D. Traditional but modern', 'Show me something traditional but modern.');
  await runTest('J. Return Policy', "What's your return policy?");
  await runTest('K. Shipping Cost', 'How much is shipping?');
  await runTest('L. Cash on Delivery', 'Do you offer Cash on Delivery?');
  await runTest('M. Non-existent product', 'Do you have a futuristic space helmet?');
  await runTest('N. Zero inventory / unrealistic price', 'Show me lehengas under ₹50.');
  await runTest('O. Unconfigured store policy', 'What are your store hours in London?');
}

main().catch(console.error);
