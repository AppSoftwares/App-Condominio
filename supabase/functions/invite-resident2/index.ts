import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { email, first_name, last_name, house_number, residential_cluster, role } = await req.json()
    const cleanEmail = email.trim().toLowerCase()

    // 1. Generar contraseña provisional
    const charset = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const provisionalPassword = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map((x) => charset[x % charset.length]).join("");

    // 2. Intentar invitar
    // IMPORTANTE: Asegúrate de que esta URL esté en Auth > URL Configuration > Redirect URLs
    const redirectUrl = "https://app-condominio-six.vercel.app/reset-password";

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      cleanEmail,
      {
        redirectTo: redirectUrl,
        data: {
          first_name: first_name || "Residente",
          last_name: last_name || "",
          password_provisional: provisionalPassword,
          password_set: false
        },
      }
    )

    if (inviteError) {
      return new Response(JSON.stringify({
        error: `Error de Supabase Auth: ${inviteError.message}. Sugerencia: 1. Verifica si alcanzaste el límite de 3 correos/hora. 2. Revisa que la plantilla de Email no tenga errores de sintaxis. 3. Verifica la Redirect URL.`
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 3. Registrar en base de datos
    await supabaseAdmin.from('profiles').upsert([{
      id: inviteData.user.id,
      email: cleanEmail,
      first_name,
      last_name,
      role: role || 'resident',
      residential_cluster,
      house_number,
      status: 'active'
    }])

    return new Response(JSON.stringify({ ok: true, password: provisionalPassword }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
