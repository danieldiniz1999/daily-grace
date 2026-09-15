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
            console.error('[keepalive] erro na consulta:', error.message);
            return new Response(JSON.stringify({ ok: false, error: 'Falha no keepalive' }), {
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
          console.error('[keepalive] erro interno:', err?.message || err);
          return new Response(JSON.stringify({ ok: false, error: 'Erro interno' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});

