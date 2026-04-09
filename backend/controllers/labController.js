import labModel from "../models/labModel.js";
import labTestModel from "../models/labTestModel.js";
import labBookingModel from "../models/labBookingModel.js";
import patientMedicalRecordModel from "../models/patientMedicalRecordModel.js";

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// Get all active labs (Syn Lab + Lancet Lab)
export const getLabs = async (req, res) => {
  try {
    const labs = await labModel.find({ isActive: true });
    res.json({ success: true, labs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get tests for a specific lab
export const getLabTests = async (req, res) => {
  try {
    const { labId } = req.params;
    const tests = await labTestModel.find({ labId, isActive: true }).sort({ category: 1, testName: 1 });
    res.json({ success: true, tests });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── USER (PATIENT) ───────────────────────────────────────────────────────────

// Book lab tests
export const bookLabTests = async (req, res) => {
  try {
    const { userId } = req.body;
    const { labId, testIds, doctorId, appointmentId, notes } = req.body;

    const lab = await labModel.findById(labId);
    if (!lab) return res.json({ success: false, message: "Lab not found" });

    const tests = await labTestModel.find({ _id: { $in: testIds }, isActive: true });
    if (!tests.length) return res.json({ success: false, message: "No valid tests selected" });

    const testItems = tests.map((t) => ({
      testId: t._id,
      testName: t.testName,
      price: t.price,
    }));

    const booking = new labBookingModel({
      userId,
      labId,
      doctorId: doctorId || null,
      appointmentId: appointmentId || null,
      tests: testItems,
      googleFormUrl: lab.googleFormUrl,
      notes,
    });

    await booking.save();

    // Add to patient's laboratory history
    await patientMedicalRecordModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          laboratoryHistory: {
            date: new Date(),
            labBookingId: booking._id,
            labName: lab.name,
            testsOrdered: tests.map((t) => t.testName),
            orderedByDoctor: doctorId ? "Doctor referred" : "Self-requested",
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, booking, googleFormUrl: lab.googleFormUrl });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get patient's lab bookings
export const getMyLabBookings = async (req, res) => {
  try {
    const { userId } = req.body;
    const bookings = await labBookingModel
      .find({ userId })
      .populate("labId", "name logo address")
      .populate("doctorId", "name speciality image")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Mark Google Form as submitted
export const markFormSubmitted = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;
    const booking = await labBookingModel.findOne({ _id: bookingId, userId });
    if (!booking) return res.json({ success: false, message: "Booking not found" });

    booking.formSubmitted = true;
    booking.formSubmittedAt = new Date();
    await booking.save();
    res.json({ success: true, message: "Form submission recorded" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── DOCTOR ───────────────────────────────────────────────────────────────────

// Doctor: get a patient's lab history
export const getPatientLabHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const record = await patientMedicalRecordModel
      .findOne({ userId: patientId })
      .populate("laboratoryHistory.labBookingId");
    res.json({ success: true, labHistory: record?.laboratoryHistory || [] });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── LAB ADMIN ────────────────────────────────────────────────────────────────

// Lab admin: update test prices
export const updateTestPrice = async (req, res) => {
  try {
    const { testId } = req.params;
    const { price, lastUpdatedBy } = req.body;
    const test = await labTestModel.findByIdAndUpdate(
      testId,
      { price, lastUpdatedBy },
      { new: true }
    );
    if (!test) return res.json({ success: false, message: "Test not found" });
    res.json({ success: true, test, message: "Price updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Lab admin: add new test
export const addLabTest = async (req, res) => {
  try {
    const test = new labTestModel(req.body);
    await test.save();
    res.json({ success: true, test, message: "Test added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Lab admin: update booking status / upload results
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, resultUrl, resultNotes } = req.body;
    const update = { status };
    if (resultUrl) {
      update.resultUrl = resultUrl;
      update.resultNotes = resultNotes;
      update.resultUploadedAt = new Date();
    }
    const booking = await labBookingModel.findByIdAndUpdate(bookingId, update, { new: true });
    if (!booking) return res.json({ success: false, message: "Booking not found" });

    // Update patient's lab history result summary
    if (resultNotes) {
      await patientMedicalRecordModel.updateOne(
        { "laboratoryHistory.labBookingId": bookingId },
        { $set: { "laboratoryHistory.$.resultSummary": resultNotes, "laboratoryHistory.$.resultUrl": resultUrl } }
      );
    }

    res.json({ success: true, booking, message: "Booking updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// Admin: create/update lab entry
export const upsertLab = async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    let lab;
    if (_id) {
      lab = await labModel.findByIdAndUpdate(_id, data, { new: true });
    } else {
      lab = new labModel(data);
      await lab.save();
    }
    res.json({ success: true, lab });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Admin: get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await labBookingModel
      .find({})
      .populate("userId", "name email phone")
      .populate("labId", "name")
      .populate("doctorId", "name speciality")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};