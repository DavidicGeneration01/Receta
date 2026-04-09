import pharmacyModel from "../models/pharmacyModel.js";

export const getPharmacies = async (req, res) => {
  try {
    const pharmacies = await pharmacyModel.find({ isActive: true });
    res.json({ success: true, pharmacies });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const upsertPharmacy = async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    let pharmacy;
    if (_id) {
      pharmacy = await pharmacyModel.findByIdAndUpdate(_id, data, { new: true });
    } else {
      pharmacy = new pharmacyModel(data);
      await pharmacy.save();
    }
    res.json({ success: true, pharmacy });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};