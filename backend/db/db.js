import { JSONFilePreset } from 'lowdb/node'

const db = await JSONFilePreset('db.json', { subjects: [
    { id: '1', name: 'John Doe', age: 30, condition: 'Arthritis' },
] })

export default db