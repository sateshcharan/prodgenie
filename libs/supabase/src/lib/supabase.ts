import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
