import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized: No hay header de auth', { status: 401, headers: corsHeaders })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) return new Response('Unauthorized: Token inválido', { status: 401, headers: corsHeaders })

    const { data: callerProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, residential_cluster')
      .eq('id', user.id)
      .single()

    if (profileError || !callerProfile || !['admin', 'superadmin'].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: solo administradores' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const { email, first_name, last_name, house_number, residential_cluster, role } = await req.json()
    if (!email) return new Response(JSON.stringify({ error: 'Falta el email' }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const cleanEmail = email.trim().toLowerCase()

    // 1. Invitar al usuario via Auth Admin API
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      cleanEmail,
      {
        redirectTo: `${Deno.env.get('APP_URL')}/reset-password`,
        data: {
          first_name,
          last_name,
          password_set: false
        },
      }
    )

    if (inviteError) {
      console.error('Invite error:', inviteError)
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 2. Crear el perfil en la tabla profiles
    const { error: insertError } = await supabaseAdmin.from('profiles').upsert([{
      id: inviteData.user.id,
      email: cleanEmail,
      first_name,
      last_name,
      role: role || 'resident',
      residential_cluster: residential_cluster || callerProfile.residential_cluster,
      house_number,
      status: 'active',
      updated_at: new Date().toISOString()
    }])

    if (insertError) {
      console.error('Profile insert error:', insertError)
      // Opcional: Podrías borrar el usuario invitado si falla el insert,
      // pero usualmente es mejor dejarlo y que el admin intente de nuevo (upsert se encarga).
      throw insertError
    }

    return new Response(JSON.stringify({ ok: true, user_id: inviteData.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
