import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Network } from '@capacitor/network';
import { supabase } from './supabase';

interface OfflineAction {
  id?: number;
  tipo: 'payment' | 'visit' | 'package';
  payload: any;
  idempotencyKey: string;
  createdAt: number;
}

interface OfflineDB extends DBSchema {
  queue: {
    key: number;
    value: OfflineAction;
    indexes: { 'by-type': string };
  };
}

const DB_NAME = 'caminos-offline-db';
const STORE_NAME = 'queue';

async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  return openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('by-type', 'tipo');
    },
  });
}

export async function enqueueAction(action: Omit<OfflineAction, 'createdAt'>) {
  const db = await getDB();
  await db.add(STORE_NAME, {
    ...action,
    createdAt: Date.now(),
  });
  console.log(`Acción ${action.tipo} encolada offline.`);
}

export async function flushQueue() {
  const status = await Network.getStatus();
  if (!status.connected) return;

  const db = await getDB();
  const actions = await db.getAll(STORE_NAME);

  if (actions.length === 0) return;

  console.log(`Sincronizando ${actions.length} acciones pendientes...`);

  for (const action of actions) {
    try {
      let success = false;
      if (action.tipo === 'payment') {
        const { error } = await supabase.rpc('rpc_insert_payment', {
            ...action.payload,
            idempotency_key: action.idempotencyKey
        });
        if (!error) success = true;
      } else if (action.tipo === 'visit') {
          // Asumimos que visit es registro de casillero o similar basado en lo pedido
          const { error } = await supabase.from('casillero_virtual').insert([action.payload]);
          if (!error) success = true;
      }

      if (success && action.id) {
        await db.delete(STORE_NAME, action.id);
      }
    } catch (err) {
      console.error(`Error sincronizando acción ${action.id}:`, err);
    }
  }
}

// Escuchar cambios de red para sincronizar
Network.addListener('networkStatusChange', (status) => {
  if (status.connected) {
    flushQueue();
  }
});
