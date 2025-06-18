import crypto from 'crypto'
import db from '../db/db.js'

export function Test({ subject_id, tags }) {
  const valid =
    typeof subject_id === 'string' &&
    db.data.subjects.find(s => s.id === subject_id) != null
    && typeof tags === 'object' &&
    tags !== null &&
    !Array.isArray(tags) &&
    Object.values(tags).every(value => value !== null)

  if (!valid) return null
  
  return {
    id: crypto.randomUUID(),
    record_id: crypto.randomUUID(),
    subject_id,
    tags
  }
}