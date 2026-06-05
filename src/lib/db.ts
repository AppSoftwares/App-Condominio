/**
 * Sistema de Persistencia Local (IndexedDB)
 * Asegura que el progreso no se pierda sin conexión.
 */

const DB_NAME = 'CaminosLagunitaDB'
const DB_VERSION = 1

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result

      // Store for offline actions (sync queue)
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
      }

      // Store for local user data
      if (!db.objectStoreNames.contains('local_storage')) {
        db.createObjectStore('local_storage', { keyPath: 'key' })
      }
    }
  })
}

export const addToSyncQueue = async (action: any) => {
  const db = await initDB()
  const tx = db.transaction('sync_queue', 'readwrite')
  const store = tx.objectStore('sync_queue')
  store.add({ ...action, timestamp: new Date().toISOString() })
  return tx.oncomplete
}
