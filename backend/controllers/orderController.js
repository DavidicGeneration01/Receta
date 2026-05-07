import orderModel from '../models/orderModel.js';
import pharmacyModel from '../models/pharmacyModel.js';

export const createOrder = async (req, res) => {
  try {
    const userId = req.body.userId || null;
    const { pharmacyId, items, deliveryOption, deliveryAddress } = req.body;

    if (!pharmacyId || !items || !items.length) return res.json({ success: false, message: 'Invalid order' });

    // ensure pharmacy exists
    const pharmacy = await pharmacyModel.findById(pharmacyId).select('logisticAgent').lean();
    if (!pharmacy) return res.json({ success: false, message: 'Pharmacy not found' });

    const subtotal = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
    const deliveryFee = deliveryOption === 'delivery' ? 500 : 0;
    const total = subtotal + deliveryFee;

    const orderDoc = new orderModel({
      pharmacyId,
      items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty || 1 })),
      deliveryOption,
      deliveryAddress,
      logisticAgent: pharmacy.logisticAgent || null,
      customerName: req.body.customerName || null,
      customerPhone: req.body.customerPhone || null,
      total,
    });

    await orderDoc.save();

    return res.json({ success: true, order: orderDoc });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};
export default { createOrder };
