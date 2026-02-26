import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'



console.log('ENV CHECK:', process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
// localhost:4000/api/admin/add-doctor

app.get('/', (req, res) => {
  res.send('Api working!')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})