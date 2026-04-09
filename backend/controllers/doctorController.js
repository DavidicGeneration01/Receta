import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import patientMedicalRecordModel from "../models/patientMedicalRecordModel.js"

const changeAvailability = async (req, res) => {
    try {

        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availability Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const doctorList = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message }) // ← fixed comma to dot
    }
}

// API for doctor Login
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const doctor = await doctorModel.findOne({email})

        if (!doctor) {
            return res.json({success:false,message:'Invalid credentials'})
        }

        const isMatch = await bcrypt.compare(password, doctor.password )

        if (isMatch) {

            const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)

            res.json({success:true,token})

        } else {
           res.json({success:false,message:'Invalid credentials'}) 
        }
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success:true, appointments})
        
    } catch (error) {
       console.log(error)
       res.json({ success: false, message: error.message }) 
    }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req,res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {

            await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true})
            return res.json({success:true,message:'Appointment Completed'})
        
        } else {
            return res.json({success:true,message:'Mark Failed'})
        }
        
    } catch (error) {
        console.log(error)
       res.json({ success: false, message: error.message }) 
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req,res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {

            await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true})
            return res.json({success:true,message:'Appointment Cancelled'})
        
        } else {
            return res.json({success:true,message:'Cancellation Failed'})
        }
        
    } catch (error) {
        console.log(error)
       res.json({ success: false, message: error.message }) 
    }
}


// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.forEach((item) => {              // ✅ was 'items', now 'item'
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get doctor profile for Doctor Panel
const doctorProfile = async (req,res) => {

    try {

        const {docId} = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({success:true, profileData})
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {

    try {

        const { docId, fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, {fees, address, available})

        res.json({success:true, message: 'Profile Updated'})
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get doctor's patients list
const getDoctorPatients = async (req, res) => {
    try {
        const { docId } = req.body

        // Get all appointments for this doctor
        const appointments = await appointmentModel.find({ docId }).populate('userId', 'name email phone image')

        // Get unique patients (avoid duplicates)
        const patientsMap = new Map()

        for (const appointment of appointments) {
            if (appointment.userId && !patientsMap.has(appointment.userId._id.toString())) {
                patientsMap.set(appointment.userId._id.toString(), {
                    ...appointment.userId.toObject(),
                    lastAppointment: appointment.slotDate,
                    appointmentId: appointment._id
                })
            }
        }

        const patients = Array.from(patientsMap.values())

        res.json({ success: true, patients })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to add diagnosis for a patient
const addDiagnosis = async (req, res) => {
    try {
        const { docId, userId, diagnosis, prescription, notes } = req.body

        if (!userId || !diagnosis) {
            return res.json({ success: false, message: "Patient ID and diagnosis are required" })
        }

        // Get doctor info for medical record
        const doctor = await doctorModel.findById(docId).select('name speciality')

        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        // Get patient info
        const patient = await userModel.findById(userId)

        if (!patient) {
            return res.json({ success: false, message: "Patient not found" })
        }

        // Create or update medical record
        let medicalRecord = await patientMedicalRecordModel.findOne({ userId })

        if (!medicalRecord) {
            medicalRecord = new patientMedicalRecordModel({ userId })
        }

        // Add consultation to history
        const consultationEntry = {
            appointmentId: null,
            doctorId: docId,
            doctorName: doctor.name,
            speciality: doctor.speciality,
            consultationDate: new Date(),
            diagnosis: diagnosis,
            prescription: prescription || [],
            notes: notes || ""
        }

        medicalRecord.consultationHistory.push(consultationEntry)
        medicalRecord.lastUpdated = Date.now()

        await medicalRecord.save()

        res.json({ success: true, message: "Diagnosis added successfully", medicalRecord })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get patient medical record (doctor view)
const getPatientMedicalRecord = async (req, res) => {
    try {
        const { userId } = req.body

        const medicalRecord = await patientMedicalRecordModel.findOne({ userId })

        if (!medicalRecord) {
            return res.json({ success: true, medicalRecord: { userId, consultationHistory: [], medicalHistory: [], labHistory: [], allergies: [] } })
        }

        res.json({ success: true, medicalRecord })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export {
     changeAvailability,
     doctorList, loginDoctor,
     appointmentsDoctor,
     appointmentCancel,
     appointmentComplete,
     doctorDashboard,
     doctorProfile,
     updateDoctorProfile,
     getDoctorPatients,
     addDiagnosis,
     getPatientMedicalRecord
}