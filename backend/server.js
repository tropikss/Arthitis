import express from 'express'
import subjectRoutes from './routes/subjectRoutes.js'

const app = express()
app.use(express.json())

app.use('/subjects', subjectRoutes)

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});