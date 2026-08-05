import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import webpush from 'web-push';

export const Route = createFileRoute('/api/public/notifications/cron')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== \`Bearer \${process.env['CRON_SECRET']}\`) {
          return new Response('Unauthorized', { status: 401 });
        }

        const { hour } = await request.json();
        
        // Configurar VAPID keys se existirem
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

        // 1. Buscar todos os usuários com assinaturas push
        const { data: subs } = await supabaseAdmin
          .from('push_subscriptions')
          .select('user_id, subscription_json');

        if (!subs) return new Response('No subscriptions', { status: 200 });

        for (const sub of subs) {
          // Verificar se o usuário já concluiu o devocional de hoje
          const { data: completion } = await supabaseAdmin
            .from('devotional_completions')
            .select('id')
            .eq('user_id', sub.user_id)
            .eq('publish_date', today)
            .maybeSingle();

          let shouldSend = false;
          let message = "";

          if (hour === 5) {
            shouldSend = true;
            message = "Bom dia! Seu devocional do Daily Grace já está disponível. ✨";
          } else if ((hour === 12 || hour === 16) && !completion) {
            shouldSend = true;
            message = "Um momento para Deus? Seu devocional de hoje ainda espera por você. 🙏";
          }

          if (shouldSend && publicKey && privateKey) {
            try {
              await webpush.sendNotification(
                sub.subscription_json as any,
                JSON.stringify({
                  title: 'Daily Grace',
                  body: message,
                  url: '/devococionais'
                })
              );
            } catch (err) {
              console.error('Push error:', err);
            }
          }
        }

        return new Response('Notifications processed', { status: 200 });
      }
    }
  }
});
