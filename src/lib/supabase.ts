import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Debug: Log Realtime connection status
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Client initialized');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('🔌 Realtime enabled:', !!supabase.realtime);
}
