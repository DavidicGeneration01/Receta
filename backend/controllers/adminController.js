import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import { getPagination } from "../utils/queryOptions.js"
import { releaseAppointmentSlot } from "../services/appointmentService.js"

const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
    const imageFile = req.file

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ success: false, message: "Missing Details" })
    }

    if (!imageFile) {
      return res.json({ success: false, message: "Doctor image is required" })
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })

    await doctorModel.create({
      name,
      email,
      image: imageUpload.secure_url,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    })

    res.json({ success: true, message: "Doctor added successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET)
      return res.json({ success: true, token })
    }

    res.json({ success: false, message: "Invalid credentials" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password").sort({ date: -1 }).lean()
    res.json({ success: true, doctors })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const appointmentsAdmin = async (req, res) => {
  try {
    const { limit, skip, page } = getPagination(req.query)

    const [appointments, total] = await Promise.all([
      appointmentModel.find({}).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      appointmentModel.countDocuments({}),
    ])

    res.json({ success: true, appointments, pagination: { page, limit, total } })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body

    const appointmentData = await appointmentModel
      .findByIdAndUpdate(appointmentId, { cancelled: true }, { new: true })
      .select("docId slotDate slotTime")
      .lean()

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" })
    }

    await releaseAppointmentSlot(appointmentData)
    res.json({ success: true, message: "Appointment Cancelled" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const adminDashboard = async (req, res) => {
  try {
    const [doctors, users, appointments, latestAppointments] = await Promise.all([
      doctorModel.countDocuments({}),
      userModel.countDocuments({}),
      appointmentModel.countDocuments({}),
      appointmentModel.find({}).sort({ date: -1 }).limit(5).lean(),
    ])

    const dashData = {
      doctors,
      appointments,
      patients: users,
      latestAppointments,
    }

    res.json({ success: true, dashData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
}
