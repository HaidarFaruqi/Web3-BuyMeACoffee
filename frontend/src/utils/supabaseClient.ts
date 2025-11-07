import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate that credentials are provided
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found in environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
