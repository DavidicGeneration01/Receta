import validator from "validator"
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import { getPagination } from "../utils/queryOptions.js"
import { releaseAppointmentSlot } from "../services/appointmentService.js"

// API for adding doctor
const addDoctor = async (req, res) => {

    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file
        
        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({success: false, message: "Missing Details"})
        }
        
        // Validating email format
        if (!validator.isEmail(email)) {
            return res.json({success: false, message: "Please enter a valid email"})
        }

        // validating strong password
        if (password.length < 8 ) {
           return res.json({success: false, message: "Please enter a Strong password"}) 
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"})
        const imageUrl = imageUpload.secure_url

        // FIXED: Changed variable name from doctorDate to doctorData
        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success: true, message: "Doctor added successfully"})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// API For Admin Login
const loginAdmin = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET,{})
            res.json({success: true, token})
        } else {
            res.json({success: false, message: "Invalid credentials"})
        }

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req,res) => {
    try {
        
        const doctors = await doctorModel.find({}).select('-password').sort({ date: -1 }).lean()
        res.json({success:true,doctors})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }

}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
        const { limit, skip, page } = getPagination(req.query)
        const [appointments, total] = await Promise.all([
            appointmentModel.find({}).sort({ date: -1 }).skip(skip).limit(limit).lean(),
            appointmentModel.countDocuments({})
        ])

        res.json({success:true, appointments, pagination: { page, limit, total }})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}

// API  for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel
            .findByIdAndUpdate(appointmentId, { cancelled: true }, { new: true })
            .select('docId slotDate slotTime')
            .lean()

        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        await releaseAppointmentSlot(appointmentData)

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {

    try {

        const [doctors, users, appointments, latestAppointments] = await Promise.all([
            doctorModel.countDocuments({}),
            userModel.countDocuments({}),
            appointmentModel.countDocuments({}),
            appointmentModel.find({}).sort({ date: -1 }).limit(5).lean()
        ])

        const dashData = {
            doctors,
            appointments,
            patients: users,
            latestAppointments
        }

        res.json({success:true,dashData})


        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard }
