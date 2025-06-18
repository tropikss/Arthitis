import { JSONFilePreset } from 'lowdb/node'

const db = await JSONFilePreset('db.json', { subjects: [], tests: [], tags: [], category: [] })

export default db