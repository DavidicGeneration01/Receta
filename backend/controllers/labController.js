import labModel from "../models/labModel.js"
import labTestModel from "../models/labTestModel.js"
import labBookingModel from "../models/labBookingModel.js"
import patientMedicalRecordModel from "../models/patientMedicalRecordModel.js"
import { getPagination } from "../utils/queryOptions.js"

export const getLabs = async (req, res) => {
  try {
    const labs = await labModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean()
    res.json({ success: true, labs })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const getLabTests = async (req, res) => {
  try {
    const { labId } = req.params
    const tests = await labTestModel
      .find({ labId, isActive: true })
      .sort({ category: 1, testName: 1 })
      .lean()

    res.json({ success: true, tests })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const bookLabTests = async (req, res) => {
  try {
    const { userId, labId, testIds, doctorId, appointmentId, notes } = req.body

    if (!userId || !labId || !Array.isArray(testIds) || !testIds.length) {
      return res.json({ success: false, message: "Missing required fields" })
    }

    const lab = await labModel.findById(labId).select("name googleFormUrl").lean()

    if (!lab) {
      return res.json({ success: false, message: "Lab not found" })
    }

    const tests = await labTestModel
      .find({ _id: { $in: testIds }, isActive: true })
      .select("testName price")
      .lean()

    if (!tests.length) {
      return res.json({ success: false, message: "No valid tests selected" })
    }

    const testItems = tests.map((test) => ({
      testId: test._id,
      testName: test.testName,
      price: test.price,
    }))

    const booking = await labBookingModel.create({
      userId,
      labId,
      doctorId: doctorId || null,
      appointmentId: appointmentId || null,
      tests: testItems,
      googleFormUrl: lab.googleFormUrl,
      notes,
    })

    await patientMedicalRecordModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          laboratoryHistory: {
            date: new Date(),
            labBookingId: booking._id,
            labName: lab.name,
            testsOrdered: tests.map((test) => test.testName),
            orderedByDoctor: doctorId ? "Doctor referred" : "Self-requested",
          },
        },
      },
      { upsert: true, new: true }
    )

    res.json({ success: true, booking, googleFormUrl: lab.googleFormUrl })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const getMyLabBookings = async (req, res) => {
  try {
    const { userId } = req.body
    const { limit, skip, page } = getPagination(req.query)

    const [bookings, total] = await Promise.all([
      labBookingModel
        .find({ userId })
        .populate("labId", "name logo address")
        .populate("doctorId", "name speciality image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      labBookingModel.countDocuments({ userId }),
    ])

    res.json({ success: true, bookings, pagination: { page, limit, total } })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const markFormSubmitted = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { userId } = req.body

    const booking = await labBookingModel.findOne({ _id: bookingId, userId }).select("_id").lean()

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" })
    }

    await labBookingModel.updateOne(
      { _id: bookingId, userId },
      { $set: { formSubmitted: true, formSubmittedAt: new Date() } }
    )

    res.json({ success: true, message: "Form submission recorded" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const getPatientLabHistory = async (req, res) => {
  try {
    const { patientId } = req.params
    const record = await patientMedicalRecordModel
      .findOne({ userId: patientId })
      .populate("laboratoryHistory.labBookingId")
      .lean()

    res.json({ success: true, labHistory: record?.laboratoryHistory || [] })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const updateTestPrice = async (req, res) => {
  try {
    const { testId } = req.params
    const { price, lastUpdatedBy } = req.body

    const test = await labTestModel.findByIdAndUpdate(
      testId,
      { price, lastUpdatedBy },
      { new: true }
    )

    if (!test) {
      return res.json({ success: false, message: "Test not found" })
    }

    res.json({ success: true, test, message: "Price updated successfully" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const addLabTest = async (req, res) => {
  try {
    const test = await labTestModel.create(req.body)
    res.json({ success: true, test, message: "Test added successfully" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { status, resultUrl, resultNotes } = req.body
    const update = { status }

    if (resultUrl) {
      update.resultUrl = resultUrl
      update.resultNotes = resultNotes
      update.resultUploadedAt = new Date()
    }

    const booking = await labBookingModel.findByIdAndUpdate(bookingId, update, { new: true })

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" })
    }

    if (resultNotes) {
      await patientMedicalRecordModel.updateOne(
        { "laboratoryHistory.labBookingId": bookingId },
        {
          $set: {
            "laboratoryHistory.$.resultSummary": resultNotes,
            "laboratoryHistory.$.resultUrl": resultUrl,
          },
        }
      )
    }

    res.json({ success: true, booking, message: "Booking updated" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const upsertLab = async (req, res) => {
  try {
    const { _id, ...data } = req.body
    const lab = _id
      ? await labModel.findByIdAndUpdate(_id, data, { new: true })
      : await labModel.create(data)

    res.json({ success: true, lab })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const getAllBookings = async (req, res) => {
  try {
    const { limit, skip, page } = getPagination(req.query)

    const [bookings, total] = await Promise.all([
      labBookingModel
        .find({})
        .populate("userId", "name email phone")
        .populate("labId", "name")
        .populate("doctorId", "name speciality")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      labBookingModel.countDocuments({}),
    ])

    res.json({ success: true, bookings, pagination: { page, limit, total } })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}
