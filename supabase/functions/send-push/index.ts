import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // 1. Verificación de Secreto (Seguridad de invocación)
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
  if (req.headers.get('x-webhook-secret') !== webhookSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { record } = await req.json()

    // 2. Cliente administrativo
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload = {
      to: record.token,
      title: record.title,
      body: record.body,
      data: record.data,
      sound: "default",
      priority: "high",
    }

    // 3. Envío real a Expo (Servicio gratuito y universal)
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = await res.json()
    const expoError = result?.data?.status === 'error' ? result.data.message : null

    // 4. Actualización del historial (Éxito o error de Expo)
    await supabaseAdmin.from('push_notifications').update({
      status: expoError ? 'error' : 'sent',
      error_message: expoError,
      sent_at: new Date().toISOString()
    }).eq('id', record.id)

    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
