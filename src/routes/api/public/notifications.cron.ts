import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import webpush from 'web-push';
import { timingSafeEqual } from 'crypto';

export const Route = createFileRoute('/api/public/notifications/cron')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get('Authorization') ?? '';
        const secret = process.env['CRON_SECRET']?.trim();
        
        if (!secret) {
          console.error('[cron] CRON_SECRET não configurado no ambiente.');
          return new Response('Unauthorized', { status: 401 });
        }

        const expectedHeader = `Bearer ${secret}`;
        const authBuffer = Buffer.from(authHeader);
        const expectedBuffer = Buffer.from(expectedHeader);

        if (
          authBuffer.length !== expectedBuffer.length ||
          !timingSafeEqual(authBuffer, expectedBuffer)
        ) {
          return new Response('Unauthorized', { status: 401 });
        }

        let hour: number | undefined;
        try {
          const body = await request.json();
          if (typeof body?.hour === 'number') {
            hour = body.hour;
          }
        } catch {
          return new Response('Bad Request', { status: 400 });
        }

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

        const { data: subs, error: subError } = await supabaseAdmin
          .from('push_subscriptions')
          .select('user_id, subscription_json');

        if (subError || !subs) return new Response('No subscriptions or error', { status: 200 });

        for (const sub of subs) {
          const userId = sub.user_id;
          const pushData = sub.subscription_json;

          const { data: completion } = await supabaseAdmin
            .from('devotional_completions')
            .select('id')
            .eq('user_id', userId)
            .gte('completed_at', `${today}T00:00:00`)
            .lte('completed_at', `${today}T23:59:59`)
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
