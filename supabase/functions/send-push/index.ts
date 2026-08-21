// supabase/functions/send-push/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleAuth } from "https://esm.sh/google-auth-library@9"

serve(async (req) => {
  // 1. Verificación de Secreto (Seguridad de invocación)
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
  if (req.headers.get('x-webhook-secret') !== webhookSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { record } = await req.json()

    // 2. Cliente administrativo para actualizar el estado
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 3. Autenticación con Google FCM v1
    const saJson = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_JSON')!)
    const auth = new GoogleAuth({
      credentials: saJson,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })
    const client = await auth.getClient()
    const accessToken = (await client.getAccessToken()).token

    // 4. Envío real a FCM v1
    const fcmRes = await fetch(
      `https://fcm.googleapis.com/v1/projects/${Deno.env.get('FCM_PROJECT_ID')}/messages:send`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: record.token,
            notification: {
              title: record.title,
              body: record.body
            },
            data: record.data ? Object.fromEntries(
              Object.entries(record.data).map(([k, v]) => [k, String(v)])
            ) : undefined,
            android: {
              priority: "high",
              notification: {
                sound: "default",
                channel_id: "default"
              }
            },
            apns: {
              headers: {
                "apns-priority": "10"
              },
              payload: {
                aps: {
                  sound: "default"
                }
              }
            },
          },
        }),
      }
    )

    const result = await fcmRes.json()
    const fcmError = !fcmRes.ok ? (result?.error?.message ?? 'FCM error') : null

    // 5. Actualización del historial
    await supabaseAdmin.from('push_notifications').update({
      status: fcmError ? 'error' : 'sent',
      error_message: fcmError,
      sent_at: new Date().toISOString()
    }).eq('id', record.id)

    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
