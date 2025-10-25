/**
 * Test Supabase Realtime Connection
 * 
 * Chạy file này trong browser console để test connection
 */

import { supabase } from './src/lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    const { data, error } = await supabase.from('Bid').select('id').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    
    // Test 2: Check Realtime capability
    console.log('🔍 Testing Realtime subscription...');
    
    const channel = supabase.channel('test-channel');
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Bid'
        },
        (payload) => {
          console.log('✅ Realtime working! Received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime enabled and subscribed!');
          console.log('💡 Try placing a bid to see realtime updates');
          
          // Cleanup after 5 seconds
          setTimeout(() => {
            supabase.removeChannel(channel);
            console.log('🧹 Test channel cleaned up');
          }, 5000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription failed');
          console.error('💡 Make sure Replication is enabled for Bid table in Supabase Dashboard');
        }
      });
    
    return true;
  } catch (err) {
    console.error('❌ Test failed:', err);
    return false;
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('Run testSupabaseConnection() to test');
}
