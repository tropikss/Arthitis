import express from 'express'
import cors from 'cors'

import subjectRoutes from './routes/subjectRoutes.js'
import testRoutes from './routes/testRoutes.js'
import tagRoutes from './routes/tagRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/subjects', subjectRoutes)
app.use('/tests', testRoutes)
app.use('/tags', tagRoutes)
app.use('/category', categoryRoutes)
app.get('/up', (req, res) => {
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});