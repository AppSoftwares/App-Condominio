import { supabase } from '../../lib/supabase'

export interface PushMessage {
  title: string
  body: string
  data?: any
}

export const notificationService = {
  /**
   * Envía una notificación push a un usuario específico
   */
  async sendToUser(profileId: string, message: PushMessage) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('id', profileId)
        .single()

      if (!profile?.fcm_token) {
        console.warn(`Usuario ${profileId} no tiene token de push registrado.`);
        return;
      }

      // Registro en la cola de envío real
      console.log(`Encolando Push para ${profileId} (${profile.fcm_token})`);

      // Registro en la cola de envío real
      await supabase.rpc('rpc_send_push', {
        p_token: profile.fcm_token,
        p_title: message.title,
        p_body: message.body,
        p_data: message.data
      })
    } catch (err) {
      console.error('Error enviando notificación push:', err)
    }
  },

  /**
   * Notifica a todos los residentes de un conjunto residencial (Optimizado)
   */
  async notifyCluster(clusterName: string, message: PushMessage) {
    try {
      // Búsqueda flexible para el conjunto para asegurar que coincidan admin y residentes
      const cleanCluster = clusterName.replace(/Conjunto\s+\d+\s+/i, '').trim();

      const { data: residents, error } = await supabase
        .from('profiles')
        .select('id, fcm_token')
        .ilike('residential_cluster', `%${cleanCluster}%`)
        .eq('role', 'resident')
        .not('fcm_token', 'is', null);

      if (error) throw error;
      if (!residents || residents.length === 0) {
        console.warn(`No se encontraron residentes con tokens de push en el conjunto: ${clusterName}`);
        return;
      }

      console.log(`Notificando a ${residents.length} residentes en el conjunto: ${clusterName}`);

      // Encolar todas las notificaciones en paralelo
      await Promise.all(residents.map(r =>
        supabase.rpc('rpc_send_push', {
          p_token: r.fcm_token,
          p_title: message.title,
          p_body: message.body,
          p_data: message.data
        })
      ));
    } catch (err) {
      console.error('Error notificando al conjunto:', err)
    }
  },

  /**
   * Notifica a un residente específico por su número de casa y conjunto
   */
  async notifyResidentByHouse(houseNumber: string, clusterName: string, message: PushMessage) {
    try {
      // Búsqueda flexible para el conjunto
      const cleanCluster = clusterName.replace(/Conjunto\s+\d+\s+/i, '').trim();

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, fcm_token')
        .ilike('residential_cluster', `%${cleanCluster}%`)
        .eq('house_number', houseNumber)
        .maybeSingle();

      if (profile?.id) {
        await this.sendToUser(profile.id, message);
      }
    } catch (err) {
      console.error('Error notificando a residente por casa:', err);
    }
  },

  /**
   * Notifica un incidente (queja) anónima
   */
  async reportIncidentPush(culpritHouse: string, clusterName: string, category: string) {
    // 1. Notificar al Admin
    const cleanCluster = clusterName.replace(/Conjunto\s+\d+\s+/i, '').trim();

    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .ilike('residential_cluster', `%${cleanCluster}%`)
      .eq('role', 'admin')

    const { data: guards } = await supabase
      .from('profiles')
      .select('id')
      .ilike('residential_cluster', `%${cleanCluster}%`)
      .eq('role', 'guard')

    const alertMsg = {
      title: "🚨 Nuevo Incidente Reportado",
      body: `Se ha reportado: ${category} en la Casa ${culpritHouse}.`
    }

    if (admins) admins.forEach(a => this.sendToUser(a.id, alertMsg))
    if (guards) guards.forEach(g => this.sendToUser(g.id, alertMsg))

    // 2. Notificar al Infractor (anónimamente)
    await this.notifyResidentByHouse(culpritHouse, clusterName, {
      title: "⚠️ Aviso de Convivencia",
      body: `Un residente ha reportado una novedad relacionada con ${category.toLowerCase()} en su domicilio. Por favor, colabore con las normas del conjunto.`
    });
  }
}
