import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import labRouter from './routes/labRoute.js';
import pharmacyRouter from './routes/pharmacyRoute.js';
import pharmacyProductRouter from './routes/pharmacyProductRoute.js';
import orderRouter from './routes/orderRoute.js';
import messageRouter from './routes/messageRoute.js';
import medicalRecordRouter from './routes/medicalRecordRoute.js';
import logger from './scripts/Logger.js';




// app config
const app = express()
const port = process.env.PORT || 4000
connectCloudinary()

// middlewares
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }))
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }))

// api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/lab',labRouter)
app.use('/api/pharmacy',pharmacyRouter)
app.use('/api/pharmacy-product', pharmacyProductRouter)
app.use('/api/order', orderRouter)
app.use('/api/message',messageRouter)
app.use('/api/medical-record',medicalRecordRouter)
// localhost:4000/api/admin/add-doctor

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Raw swagger JSON for debugging
app.get('/swagger.json', (req, res) => {
  try {
    const count = swaggerSpec && swaggerSpec.paths ? Object.keys(swaggerSpec.paths).length : 0
    logger.debug(`Swagger spec paths: ${count}`)
    res.json(swaggerSpec)
  } catch (err) {
    logger.error('Error returning swagger spec:', err)
    res.status(500).json({ error: err.message })
  }
})


app.get('/', (req, res) => {
  res.send('Api working!')
})


const startServer = async () => {
  try {
    await connectDB()

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error.message)
    logger.error("Check MONGODB_URI and make sure your current IP address is allowed in MongoDB Atlas Network Access.")
    process.exit(1)
  }
}

startServer()
