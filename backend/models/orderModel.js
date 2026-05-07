import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'pharmacy', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'pharmacyProduct', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true, default: 1 },
    },
  ],
  deliveryOption: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
  deliveryAddress: { type: String },
  customerName: { type: String },
  customerPhone: { type: String },
  logisticAgent: { type: String },
  total: { type: Number, required: true },
  status: { type: String, default: 'created' },
}, { timestamps: true });

orderSchema.index({ pharmacyId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerPhone: 1, createdAt: -1 });

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;
