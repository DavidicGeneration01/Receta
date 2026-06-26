import doctorModel from "../models/doctorModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import patientMedicalRecordModel from "../models/patientMedicalRecordModel.js"
import { getPagination } from "../utils/queryOptions.js"
import { releaseAppointmentSlot } from "../services/appointmentService.js"

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body

    await doctorModel.findByIdAndUpdate(docId, [
      { $set: { available: { $not: ["$available"] } } },
    ])

    res.json({ success: true, message: "Availability Changed" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({})
      .select("-password -email")
      .sort({ available: -1, date: -1 })
      .lean()

    res.json({ success: true, doctors })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body
    const doctor = await doctorModel.findOne({ email }).select("password").lean()

    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, doctor.password)

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
    res.json({ success: true, token })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body
    const { limit, skip, page } = getPagination(req.query)

    const [appointments, total] = await Promise.all([
      appointmentModel.find({ docId }).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      appointmentModel.countDocuments({ docId }),
    ])

    res.json({ success: true, appointments, pagination: { page, limit, total } })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body

    const appointmentData = await appointmentModel.findById(appointmentId).select("docId").lean()

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.updateOne(
        { _id: appointmentId, docId },
        { $set: { isCompleted: true } }
      )
      return res.json({ success: true, message: "Appointment Completed" })
    }

    return res.json({ success: false, message: "Mark Failed" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body

    const appointmentData = await appointmentModel
      .findOneAndUpdate(
        { _id: appointmentId, docId },
        { $set: { cancelled: true } },
        { new: true }
      )
      .select("docId slotDate slotTime")
      .lean()

    if (!appointmentData) {
      return res.json({ success: false, message: "Cancellation Failed" })
    }

    await releaseAppointmentSlot(appointmentData)
    res.json({ success: true, message: "Appointment Cancelled" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body

    const [summary] = await appointmentModel.aggregate([
      { $match: { docId } },
      {
        $group: {
          _id: null,
          appointments: { $sum: 1 },
          patients: { $addToSet: "$userId" },
          earnings: {
            $sum: {
              $cond: [{ $or: ["$isCompleted", "$payment"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          appointments: 1,
          patients: { $size: "$patients" },
          earnings: 1,
        },
      },
    ])

    const latestAppointments = await appointmentModel
      .find({ docId })
      .sort({ date: -1 })
      .limit(5)
      .lean()

    const dashData = {
      earnings: summary?.earnings || 0,
      appointments: summary?.appointments || 0,
      patients: summary?.patients || 0,
      latestAppointments,
    }

    res.json({ success: true, dashData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body
    const profileData = await doctorModel.findById(docId).select("-password").lean()

    res.json({ success: true, profileData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

    res.json({ success: true, message: "Profile Updated" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getDoctorPatients = async (req, res) => {
  try {
    const { docId } = req.body
    const { limit } = getPagination(req.query)

    const appointments = await appointmentModel
      .find({ docId })
      .sort({ date: -1 })
      .select("userId slotDate _id")
      .limit(limit * 3)
      .lean()

    const patientsMap = new Map()

    for (const appointment of appointments) {
      if (appointment.userId && !patientsMap.has(appointment.userId)) {
        patientsMap.set(appointment.userId, {
          userId: appointment.userId,
          lastAppointment: appointment.slotDate,
          appointmentId: appointment._id,
        })
      }
    }

    const patientIds = Array.from(patientsMap.keys()).slice(0, limit)
    const patientDocs = await userModel
      .find({ _id: { $in: patientIds } })
      .select("name email phone image")
      .lean()

    const patients = patientDocs.map((patient) => ({
      ...patient,
      ...patientsMap.get(patient._id.toString()),
    }))

    res.json({ success: true, patients })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const addDiagnosis = async (req, res) => {
  try {
    const { docId, userId, diagnosis, prescription, notes } = req.body

    if (!userId || !diagnosis) {
      return res.json({ success: false, message: "Patient ID and diagnosis are required" })
    }

    const doctor = await doctorModel.findById(docId).select("name speciality").lean()

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" })
    }

    const patient = await userModel.exists({ _id: userId })

    if (!patient) {
      return res.json({ success: false, message: "Patient not found" })
    }

    const consultationEntry = {
      appointmentId: null,
      doctorId: docId,
      doctorName: doctor.name,
      speciality: doctor.speciality,
      consultationDate: new Date(),
      diagnosis,
      prescription: prescription || [],
      notes: notes || "",
    }

    const medicalRecord = await patientMedicalRecordModel.findOneAndUpdate(
      { userId },
      {
        $push: { consultationHistory: consultationEntry },
        $set: { lastUpdatedBy: docId, lastUpdatedByRole: "doctor" },
      },
      { upsert: true, new: true }
    )

    res.json({ success: true, message: "Diagnosis added successfully", medicalRecord })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getPatientMedicalRecord = async (req, res) => {
  try {
    const { userId } = req.body

    const medicalRecord = await patientMedicalRecordModel.findOne({ userId }).lean()

    if (!medicalRecord) {
      return res.json({
        success: true,
        medicalRecord: {
          userId,
          consultationHistory: [],
          medicalHistory: [],
          labHistory: [],
          allergies: [],
        },
      })
    }

    res.json({ success: true, medicalRecord })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  getDoctorPatients,
  addDiagnosis,
  getPatientMedicalRecord,
}
