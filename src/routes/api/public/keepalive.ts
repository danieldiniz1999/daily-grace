import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/api/public/keepalive')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabase
            .from('devotionals')
            .select('id')
            .limit(1);

          if (error) {
            return new Response(JSON.stringify({ ok: false, error: error.message }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          return new Response(
            JSON.stringify({
              ok: true,
              message: 'Supabase keepalive ping bem-sucedido!',
              timestamp: new Date().toISOString(),
              recordsFound: data?.length ?? 0,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: err?.message || 'unknown' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});

