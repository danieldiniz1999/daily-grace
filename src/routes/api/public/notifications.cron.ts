import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import webpush from 'web-push';

export const Route = createFileRoute('/api/public/notifications/cron')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        const secret = process.env['CRON_SECRET'];
        
        if (authHeader !== `Bearer ${secret}`) {
          return new Response('Unauthorized', { status: 401 });
        }

        const { hour } = await request.json();
        
        const publicKey = process.env['VAPID_PUBLIC_KEY'];
        const privateKey = process.env['VAPID_PRIVATE_KEY'];
        if (publicKey && privateKey) {
          webpush.setVapidDetails(
            'mailto:contato@dailygrace.app',
            publicKey,
            privateKey
          );
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Usamos cast 'as any' para evitar erros de tipo enquanto a tabela não está no types.ts
        const { data: subs, error: subError } = await (supabaseAdmin.from('push_subscriptions' as any)
          .select('user_id, subscription_json') as any);

        if (subError || !subs) return new Response('No subscriptions or error', { status: 200 });

        for (const sub of (subs as any[])) {
          const userId = sub.user_id;
          const pushData = sub.subscription_json;

          // Verificar se o usuário já concluiu o devocional de hoje
          // Tipagem forçada para evitar erros com colunas que o TS ainda não conhece
          const { data: completion } = await (supabaseAdmin
            .from('devotional_completions' as any)
            .select('id')
            .eq('user_id', userId)
            .gte('completed_at', `${today}T00:00:00`)
            .lte('completed_at', `${today}T23:59:59`)
            .maybeSingle() as any);

          let shouldSend = false;
          let message = "";

          if (hour === 5) {
            shouldSend = true;
            message = "Bom dia! Seu devocional do Daily Grace já está disponível. ✨";
          } else if ((hour === 12 || hour === 16) && !completion) {
            shouldSend = true;
            message = "Um momento para Deus? Seu devocional de hoje ainda espera por você. 🙏";
          }

          if (shouldSend && publicKey && privateKey && pushData) {
            try {
              await webpush.sendNotification(
                pushData as any,
                JSON.stringify({
                  title: 'Daily Grace',
                  body: message,
                  url: '/devocionais'
                })
              );
            } catch (err) {
              console.error(`Push error for user ${userId}:`, err);
            }
          }
        }

        return new Response('Notifications processed', { status: 200 });
      }
    }
  }
});
