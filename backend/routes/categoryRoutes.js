import express from 'express'
import db from '../db/db.js'
import { Category } from '../models/Category.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(db.data.category)
})

router.post('/', async (req, res) => {
  var category = req.body
  category = Category(category)
  if (!category) {
    return res.status(400).json({ error: 'Invalid category data' })
  }
  await db.read()

    if (!db.data.category) {
        db.data.category = []
    }
  db.data.category.push(category)
  await db.write()
  res.status(201).json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  const initialLength = db.data.category.length
  db.data.category = db.data.category.filter(u => u.id !== id)
  if (db.category.subjects.length === initialLength) {
    return res.status(404).json({ error: 'category not found' })
  }
  await db.write()
  res.json({ ok: true, message: 'category deleted successfully' })
})

router.put('/:id', async (req, res) => {
  const id = req.params.id
  const updatedCategory = req.body
  await db.read()
  const index = db.data.category.findIndex(u => u.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'category not found' })
  }
  db.data.category[index] = { ...db.data.category[index], ...updatedCategory }
  await db.write()
  res.json({ ok: true, message: 'category updated successfully' })
})

export default router
