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

router.put('/:id', async (req, res) => {
  const id = req.params.id
  const updatedSubject = req.body
  const index = db.data.subjects.findIndex(u => u.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'Subject not found' })
  }
  db.data.subjects[index] = { ...db.data.subjects[index], ...updatedSubject }
  await db.write()
  res.json({ ok: true, message: 'Subject updated successfully' })
})

export default router
