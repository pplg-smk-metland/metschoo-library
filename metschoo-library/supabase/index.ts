import { createClient } from "@supabase/supabase-js"
import { type Database } from "@/types/supabase"
const supabaseURL = import.meta.env.VITE_SUPABASE_URL
const supabaseAPIKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseURL, supabaseAPIKey)
