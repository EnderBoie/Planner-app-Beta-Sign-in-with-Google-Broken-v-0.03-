import { createClient as createSupabaseClientLib } from "@supabase/supabase-js"

export function createClient() {
  return createSupabaseClientLib(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export function createSupabaseClient() {
  return createSupabaseClientLib(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
