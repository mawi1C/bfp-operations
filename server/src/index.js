import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import incidentRoutes from './routes/incidents.routes.js'
import fileRoutes from './routes/files.routes.js'
import queryRoutes from './routes/query.routes.js'
import reportRoutes from './routes/reports.routes.js'
import userRoutes from './routes/users.routes.js'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/incidents', incidentRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/query', queryRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/users', userRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'BFP API is running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))