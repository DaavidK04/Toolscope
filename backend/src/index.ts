import express from 'express'
import cors from 'cors'
import mcpRoutes from './routes/mcp'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', mcpRoutes)

app.listen(3000, () => {
  console.log('Backend läuft auf http://localhost:3000')
})