import crypto from 'crypto'
import db from '../db/db.js'

export function Category({ name, color }) {
  const valid =
    typeof name === 'string' &&
    typeof color === 'string' && 
    db.data.category.find(c => c.name === name) == null

  if (!valid) return null
  
  return {
    id: crypto.randomUUID(),
    color : color,
    name
  }
}