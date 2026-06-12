// Creado por Jesús Pirela.
import { openDB } from 'idb'

const DB_NAME = 'caminos-lagunita-db'
const DB_VERSION = 1

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('offline_actions')) {
        db.createObjectStore('offline_actions', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('user_data')) {
        db.createObjectStore('user_data', { keyPath: 'key' })
      }
    },
  })
}
