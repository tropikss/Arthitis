import express from 'express'
import db from '../db/db.js'
import { Test } from '../models/Test.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(db.data.tests)
})

router.get('/:id', async (req, res) => {
  const id = req.params.id
  await db.read()
  const test = db.data.tests.find(t => t.id === id)
  if (!test) {
    return res.status(404).json({ error: 'Test not found' })
  }
  return res.status(200).json(test)
});

router.post('/by-subject', async (req, res) => {
  const { subject_id } = req.body
  if (!subject_id) {
    return res.status(400).json({ error: 'Subject ID is required' })
  }
  await db.read()
  const tests = db.data.tests.filter(t => t.subject_id === subject_id)
  if (tests.length === 0) {
    return res.status(404).json({ error: 'No tests found for this subject' })
  }
  res.status(200).json(tests)
});

router.post('/', async (req, res) => {
  var test = req.body
  test = Test(test)
  if (!test) {
    return res.status(400).json({ error: 'Invalid test data' })
  }
  await db.read()

    if (!db.data.tests) {
        db.data.tests = []
    }
    console.log('test', test)
  db.data.tests.push(test)
  await db.write()
  res.status(201).json({id:test.id})
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  const initialLength = db.data.tests.length
  db.data.tests = db.data.tests.filter(u => u.id !== id)
  if (db.data.tests.length === initialLength) {
    return res.status(404).json({ error: 'Test not found' })
  }
  await db.write()
  res.json({ ok: true, message: 'Test deleted successfully' })
})

export default router
