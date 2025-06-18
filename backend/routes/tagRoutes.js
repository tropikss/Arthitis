import express from 'express'
import db from '../db/db.js'
import { Tag } from '../models/Tag.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(db.data.tags)
})

router.post('/', async (req, res) => {
  var tag = req.body
  tag = Tag(tag)
  if (!tag) {
    return res.status(400).json({ error: 'Invalid tag data' })
  }
  await db.read()

    if (!db.data.tags) {
        db.data.tags = []
    }
  db.data.tags.push(tag)
  await db.write()
  res.status(201).json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  const initialLength = db.data.tags.length
  db.data.tags = db.data.tags.filter(u => u.id !== id)
  if (db.tags.subjects.length === initialLength) {
    return res.status(404).json({ error: 'tag not found' })
  }
  await db.write()
  res.json({ ok: true, message: 'tag deleted successfully' })
})

export default router
