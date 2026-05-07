import dotenv from 'dotenv';
import connectDB from '../config/mongodb.js';
import pharmacyModel from '../models/pharmacyModel.js';
import pharmacyProductModel from '../models/pharmacyProductModel.js';

dotenv.config();

const productsByPharmacy = {
  'H-MEDIX PHARMACY LIMITED': [
    { productName: 'Paracetamol 500mg', category: 'Analgesic', manufacturer: 'PharmaCorp', price: 200, stock: 120 },
    { productName: 'Amoxicillin 500mg', category: 'Antibiotic', manufacturer: 'BioLabs', price: 1200, stock: 40, requiresPrescription: true },
    { productName: 'Vitamin C 1000mg', category: 'Supplement', manufacturer: 'NutriCo', price: 800, stock: 75 },
  ],
  'Malbo Pharmacy': [
    { productName: 'Ibuprofen 200mg', category: 'Analgesic', manufacturer: 'HealWell', price: 350, stock: 60 },
    { productName: 'Cough Syrup 100ml', category: 'Respiratory', manufacturer: 'CoughAway', price: 900, stock: 30 },
  ],
  'Pharmgate Pharmacy': [
    { productName: 'Loperamide 2mg', category: 'Gastro', manufacturer: 'DigestAid', price: 450, stock: 50 },
  ],
};

const seed = async () => {
  try {
    await connectDB();
    for (const name of Object.keys(productsByPharmacy)) {
      const pharmacy = await pharmacyModel.findOne({ name: new RegExp(name.split(' ')[0], 'i') });
      if (!pharmacy) {
        console.log('Pharmacy not found for', name);
        continue;
      }
      const list = productsByPharmacy[name];
      for (const p of list) {
        const exists = await pharmacyProductModel.findOne({ pharmacyId: pharmacy._id, productName: p.productName });
        if (exists) {
          console.log('Product exists, skipping', p.productName);
          continue;
        }
        const doc = { ...p, pharmacyId: pharmacy._id };
        await new pharmacyProductModel(doc).save();
        console.log('Inserted product', p.productName, 'for', pharmacy.name);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
};

seed();
