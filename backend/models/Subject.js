import crypto from 'crypto'

export function Subject({ id, name, age, weight, height, sport }) {
  const valid =
    typeof name === 'string' &&
    typeof age === 'number' &&
    typeof weight === 'number' &&
    typeof height === 'number' &&
    typeof sport === 'number'

  if (!valid) return null
  
  return {
    id: id || crypto.randomUUID(),
    name,
    age,
    weight,
    height,
    sport
  }
}