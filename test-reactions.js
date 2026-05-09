import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function testReactions() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const supabaseUrlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
  const supabaseKeyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
  
  if (!supabaseUrlMatch || !supabaseKeyMatch) {
    console.error('Missing env vars');
    return;
  }
  
  const supabaseUrl = supabaseUrlMatch[1].replace(/[\"']/g, '').trim();
  const supabaseKey = supabaseKeyMatch[1].replace(/[\"']/g, '').trim();

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('1. Signing up test user...');
  const email = 'testuser1234_' + Date.now() + '@gmail.com';
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
  });
  
  if (authErr) {
    console.error('Auth error:', authErr);
    return;
  }
  
  const user = authData.user;
  console.log('User created:', user.id);

  console.log('2. Fetching a real post...');
  const { data: posts, error: postErr } = await supabase.from('user_posts').select('id').limit(1);
  if (postErr || !posts || posts.length === 0) {
    console.error('Failed to fetch post', postErr);
    return;
  }
  const postId = posts[0].id;
  console.log('Using post ID:', postId);

  console.log('3. Inserting reaction (like)...');
  const { error: insertErr } = await supabase.from('user_post_reactions').insert({
    post_id: postId,
    user_id: user.id,
    reaction_type: 'like'
  });
  
  if (insertErr) {
    console.error('Insert error (RLS likely):', insertErr);
  } else {
    console.log('Insert successful!');
  }

  console.log('4. Changing reaction (wow)...');
  await supabase.from('user_post_reactions').delete().eq('post_id', postId).eq('user_id', user.id);
  const { error: insert2Err } = await supabase.from('user_post_reactions').insert({
    post_id: postId,
    user_id: user.id,
    reaction_type: 'wow'
  });
  if (insert2Err) {
    console.error('Change error:', insert2Err);
  } else {
    console.log('Change successful!');
  }

  console.log('5. Deleting reaction...');
  const { error: delErr } = await supabase.from('user_post_reactions').delete().eq('post_id', postId).eq('user_id', user.id);
  if (delErr) {
    console.error('Delete error:', delErr);
  } else {
    console.log('Delete successful!');
  }
}

testReactions();
