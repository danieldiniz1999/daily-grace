import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? (globalThis as any).process?.env?.SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  (globalThis as any).process?.env?.SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Devotional = {
  id: string;
  publish_date: string;
  title: string;
  verse_reference: string;
  verse_text: string;
  content: string;
  reflection_question: string | null;
  prayer: string | null;
  daily_phrase: string | null;
  daily_phrase_author: string | null;
  created_at: string;
};
