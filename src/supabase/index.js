import { createClient } from '@supabase/supabase-js'

const supabaseURL = import.meta.env.VITE_SUPABASE_URL
const supabaseAPIKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseURL, supabaseAPIKey)
