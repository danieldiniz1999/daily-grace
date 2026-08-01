import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

// Sessão compartilhada entre todos os componentes: evita várias chamadas
// de getSession() a cada tela aberta (mais rápido e menos requisições).
let cachedSession: Session | null = null;
let resolved = false;
let sessionPromise: Promise<Session | null> | null = null;
const listeners = new Set<(s: Session | null) => void>();
let subscribed = false;

function setSession(s: Session | null) {
  cachedSession = s;
  resolved = true;
  listeners.forEach((fn) => fn(s));
}

function ensureSession() {
  if (!subscribed) {
    subscribed = true;
    supabase.auth.onAuthStateChange((_event, s) => setSession(s));
  }
  if (!sessionPromise) {
    sessionPromise = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      return data.session;
    });
  }
  return sessionPromise;
}

export function useAuth() {
  const [session, setLocal] = useState<Session | null>(cachedSession);
  const [loading, setLoading] = useState(!resolved);

  useEffect(() => {
    const listener = (s: Session | null) => {
      setLocal(s);
      setLoading(false);
    };
    listeners.add(listener);
    void ensureSession().then(() => setLoading(false));
    if (resolved) {
      setLocal(cachedSession);
      setLoading(false);
    }
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { session, user: (session?.user ?? null) as User | null, loading };
}
