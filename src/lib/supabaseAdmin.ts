import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://ejfwrofizwitkmgsctsb.supabase.co";

// This client uses the service role key and bypasses RLS policies
// Only use this for admin operations where you need full database access
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  // Service role key will be loaded from edge function environment
  // For client-side admin operations, we'll need to route through an edge function
  "SERVICE_ROLE_KEY_PLACEHOLDER", // This will be replaced by edge function calls
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);