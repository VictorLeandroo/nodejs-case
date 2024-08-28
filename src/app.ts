import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import measureRoutes from './routes/measureRoutes'
import errorHandler  from './middleware/errorHandler'

const app = express()

app.use('/api/measures', measureRoutes)

app.use(errorHandler)

export default app