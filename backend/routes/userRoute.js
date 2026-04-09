import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentFlutterwave, verifyFlutterwave, bookLabTest, getUserLabBookings, cancelLabBooking, getMedicalRecord, updateMedicalRecord } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)

userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-flutterwave',authUser,paymentFlutterwave)
userRouter.post('/verifyFlutterwave',authUser,verifyFlutterwave)

// Lab booking routes
userRouter.post('/book-lab-test', authUser, bookLabTest)
userRouter.get('/lab-bookings', authUser, getUserLabBookings)
userRouter.post('/cancel-lab-booking', authUser, cancelLabBooking)

// Medical record routes
userRouter.get('/medical-record', authUser, getMedicalRecord)
userRouter.post('/update-medical-record', authUser, updateMedicalRecord)

export default userRouter