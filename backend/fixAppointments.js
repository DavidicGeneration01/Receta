import mongoose from 'mongoose'
import appointmentModel from './models/appointmentModel.js'
import doctorModel from './models/doctorModel.js'
import 'dotenv/config'

const fix = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to DB')

    const appointments = await appointmentModel.find({})
    console.log(`Found ${appointments.length} appointments`)

    for (const appt of appointments) {
        const doctor = await doctorModel.findById(appt.docId).select('-password')
        if (doctor) {
            await appointmentModel.findByIdAndUpdate(appt._id, {
                docData: {
                    ...appt.docData,
                    image: doctor.image,       // ← patch the image from doctors collection
                    name: doctor.name,
                    speciality: doctor.speciality,
                    degree: doctor.degree,
                    experience: doctor.experience,
                    about: doctor.about,
                    fees: doctor.fees,
                    address: doctor.address,
                }
            })
            console.log(`Fixed appointment ${appt._id} with image: ${doctor.image}`)
        }
    }

    console.log('All appointments fixed!')
    process.exit(0)
}

fix().catch(console.error)