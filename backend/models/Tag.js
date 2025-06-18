import crypto from 'crypto'
import db from '../db/db.js'

export function Tag({ name, category_id }) {
  const valid =
    typeof name === 'string' &&
    typeof category_id === 'string' && 
    db.data.tags.find(t => t.name === name) == null &&
    db.data.category.find(c => c.id === category_id) != null

  if (!valid) return null
  
  return {
    id: crypto.randomUUID(),
    category_id : category_id,
    name
  }
}