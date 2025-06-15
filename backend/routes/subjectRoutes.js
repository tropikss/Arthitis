import express from 'express'
import db from '../db/db.js'
import { Subject } from '../models/Subject.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(db.data.subjects)
})

router.post('/', async (req, res) => {
  var subject = req.body
  subject = Subject(subject)
  if (!subject) {
    return res.status(400).json({ error: 'Invalid subject data' })
  }
  db.data.subjects.push(subject)
  await db.write()
  res.status(201).json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  const initialLength = db.data.subjects.length
  db.data.subjects = db.data.subjects.filter(u => u.id !== id)
  if (db.data.subjects.length === initialLength) {
    return res.status(404).json({ error: 'Subject not found' })
  }
  await db.write()
  res.json({ ok: true, message: 'Subject deleted successfully' })
})

export default router
