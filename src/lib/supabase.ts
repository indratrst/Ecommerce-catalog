import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Best practice: Satu instance client yang diexport untuk kebutuhan frontend/backend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
