import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://oouviympqvwyjcocbaza.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdXZpeW1wcXZ3eWpjb2NiYXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjMxMDEsImV4cCI6MjEwMDkzOTEwMX0.Oo2B1wOacnQLLyHQn5zoC5Mf1yeowN3pT7tnuv8h1dc";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  (globalThis as any).process?.env?.SUPABASE_URL ??
  FALLBACK_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  (globalThis as any).process?.env?.SUPABASE_PUBLISHABLE_KEY ??
  FALLBACK_SUPABASE_ANON_KEY;

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
