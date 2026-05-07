import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import labBookingModel from '../models/labBookingModel.js'
import labTestModel from '../models/labTestModel.js'
import patientMedicalRecordModel from '../models/patientMedicalRecordModel.js'
import conversationModel from '../models/conversationModel.js'
import Flutterwave from 'flutterwave-node-v3'
import { getPagination } from "../utils/queryOptions.js"
import { releaseAppointmentSlot } from "../services/appointmentService.js"

// Initialize Flutterwave with your keys
const flw = new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
)

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing details" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = { name, email, password: hashedPassword }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email }).select('password').lean()

        if (!user) {
            return res.json({ success: false, message: 'User does not exist' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password').lean()
        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: JSON.parse(address),
            dob,
            gender
        })

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageURL = imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: "Profile Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password').lean()

        if (!docData || !docData.available) {
            return res.json({ success: false, message: 'Doctor not available' })
        }

        const slotUpdate = await doctorModel.updateOne(
            { _id: docId, available: true, [`slots_booked.${slotDate}`]: { $ne: slotTime } },
            { $addToSet: { [`slots_booked.${slotDate}`]: slotTime } }
        )

        if (!slotUpdate.modifiedCount) {
            return res.json({ success: false, message: 'Slot not available' })
        }

        const userData = await userModel.findById(userId).select('-password').lean()
        if (!userData) {
            await releaseAppointmentSlot({ docId, slotDate, slotTime })
            return res.json({ success: false, message: 'User not found' })
        }

        const docDataPlain = { ...docData }
        delete docDataPlain.slots_booked

        // Payment Calculation
        const docFees = docData.fees || 0
        const serviceRate = Number(process.env.SERVICE_RATE) || 0.05
        const vatRate = Number(process.env.VAT_RATE) || 0.075

        const serviceCharge = Number((docFees * serviceRate).toFixed(2))
        const vat = Number(((docFees + serviceCharge) * vatRate).toFixed(2))
        const appointmentData = {
            userId,
            docId,
            userData,
            docData: docDataPlain,   // ← now image and all fields are preserved
            amount: docData.fees,
            serviceCharge,
            vat,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        const savedAppointment = await newAppointment.save()

        // AUTO-CREATE CONVERSATION FOR APPOINTMENT
        try {
            // Check if conversation already exists
            await conversationModel.findOneAndUpdate(
                { userId, doctorId: docId, appointmentId: savedAppointment._id },
                {
                    $setOnInsert: {
                    participants: [
                        { id: userId, type: "user", name: userData.name },
                        { id: docId, type: "doctor", name: docData.name }
                    ],
                    userId,
                    doctorId: docId,
                    appointmentId: savedAppointment._id
                }
                },
                { upsert: true, new: true }
            )
        } catch (convError) {
            console.log('Conversation creation error:', convError)
            // Don't fail appointment if conversation creation fails
        }

        res.json({ success: true, message: 'Appointment Booked', appointment: savedAppointment })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body
        const { limit, skip, page } = getPagination(req.query)
        const [appointments, total] = await Promise.all([
            appointmentModel.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit).lean(),
            appointmentModel.countDocuments({ userId })
        ])
        res.json({ success: true, appointments, pagination: { page, limit, total } })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findOneAndUpdate(
            { _id: appointmentId, userId },
            { $set: { cancelled: true } },
            { new: true }
        ).select('docId slotDate slotTime').lean()

        if (!appointmentData) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await releaseAppointmentSlot(appointmentData)

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment for appointment using Flutterwave
const paymentFlutterwave = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId).select('amount cancelled').lean()

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment cancelled or not found" })
        }

        const order = {
            id: appointmentData._id.toString(),
            amount: appointmentData.amount,
            currency: process.env.CURRENCY || 'NGN',
            receipt: appointmentId,
        }

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment from Flutterwave redirect
const verifyFlutterwave = async (req, res) => {
    try {
        const { tx_ref, transaction_id } = req.body

        if (!transaction_id) {
            return res.json({ success: false, message: "No transaction ID provided" })
        }

        // Verify the transaction with Flutterwave
        const response = await flw.Transaction.verify({ id: transaction_id })

        if (
            response.data.status === "successful" &&
            response.data.tx_ref === tx_ref
        ) {
            // Extract appointmentId from tx_ref: "txref-{appointmentId}-{timestamp}"
            const parts = tx_ref.split('-')
            // tx_ref format: txref-{appointmentId}-{Date.now()}
            // appointmentId is between first and last dash segments
            const appointmentId = parts.slice(1, parts.length - 1).join('-')

            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })

            res.json({ success: true, message: "Payment Successful" })
        } else {
            res.json({ success: false, message: "Payment verification failed" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Book lab test
const bookLabTest = async (req, res) => {
    try {
        const { userId, labId, testId, slotDate, slotTime, testType, address, appointmentId } = req.body

        if (!userId || !labId || !testId || !slotDate || !slotTime) {
            return res.json({ success: false, message: "Missing required fields" })
        }

        const labTest = await labTestModel.findById(testId).select('price').lean()
        if (!labTest) {
            return res.json({ success: false, message: "Lab test not found" })
        }

        const bookingData = {
            userId,
            labId,
            testId,
            slotDate,
            slotTime,
            testType: testType || "lab_visit",
            address: address || {},
            amount: labTest.price,
            appointmentId: appointmentId || null
        }

        const newBooking = new labBookingModel(bookingData)
        const booking = await newBooking.save()

        res.json({ success: true, message: "Lab test booked", booking })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get user's lab bookings
const getUserLabBookings = async (req, res) => {
    try {
        const { userId } = req.body

        const { limit, skip, page } = getPagination(req.query)
        const [bookings, total] = await Promise.all([
            labBookingModel.find({ userId })
                .populate('labId', 'name phone address')
                .populate('testId', 'testName price')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            labBookingModel.countDocuments({ userId })
        ])

        res.json({ success: true, bookings, pagination: { page, limit, total } })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel lab booking
const cancelLabBooking = async (req, res) => {
    try {
        const { userId, bookingId } = req.body

        const booking = await labBookingModel.findOneAndUpdate(
            { _id: bookingId, userId },
            { $set: { status: "cancelled" } },
            { new: true }
        ).select('_id').lean()

        if (!booking) {
            return res.json({ success: false, message: "Unauthorized action" })
        }

        res.json({ success: true, message: "Lab booking cancelled" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get patient's medical history
const getMedicalRecord = async (req, res) => {
    try {
        const { userId } = req.body

        const medicalRecord = await patientMedicalRecordModel.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId } },
            { upsert: true, new: true }
        ).lean()

        res.json({ success: true, medicalRecord })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update medical record (consultation history, lab history, etc.)
const updateMedicalRecord = async (req, res) => {
    try {
        const { userId, recordType, recordData } = req.body

        if (!recordType || !recordData) {
            return res.json({ success: false, message: "Record type and data are required" })
        }

        let updateQuery = {}

        switch (recordType) {
            case "consultation":
                updateQuery = { $push: { consultationHistory: recordData } }
                break
            case "medical":
                updateQuery = { $push: { medicalHistory: recordData } }
                break
            case "lab":
                updateQuery = { $push: { labHistory: recordData } }
                break
            case "allergy":
                updateQuery = { $push: { allergies: recordData } }
                break
            case "emergency":
                updateQuery = { emergencyContact: recordData }
                break
            default:
                return res.json({ success: false, message: "Invalid record type" })
        }

        updateQuery.$set = { ...(updateQuery.$set || {}), lastUpdated: Date.now() }

        const updatedRecord = await patientMedicalRecordModel.findOneAndUpdate(
            { userId },
            updateQuery,
            { new: true, upsert: true }
        )

        res.json({ success: true, message: "Medical record updated", medicalRecord: updatedRecord })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentFlutterwave,
    verifyFlutterwave,
    bookLabTest,
    getUserLabBookings,
    cancelLabBooking,
    getMedicalRecord,
    updateMedicalRecord
}
