import doctorModel from "../models/doctorModel.js";

export const releaseAppointmentSlot = async ({ docId, slotDate, slotTime }) => {
  if (!docId || !slotDate || !slotTime) return;

  await doctorModel.updateOne(
    { _id: docId },
    { $pull: { [`slots_booked.${slotDate}`]: slotTime } }
  );
};
