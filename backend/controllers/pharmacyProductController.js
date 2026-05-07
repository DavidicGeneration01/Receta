import pharmacyProductModel from '../models/pharmacyProductModel.js';
import { getPagination } from '../utils/queryOptions.js';

export const getProductsByPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { limit, skip, page } = getPagination(req.query);
    const [products, total] = await Promise.all([
      pharmacyProductModel.find({ pharmacyId }).sort({ category: 1, productName: 1 }).skip(skip).limit(limit).lean(),
      pharmacyProductModel.countDocuments({ pharmacyId }),
    ]);
    res.json({ success: true, products, pagination: { page, limit, total } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
