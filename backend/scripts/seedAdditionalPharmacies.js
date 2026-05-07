import dotenv from 'dotenv';
import connectDB from '../config/mongodb.js';
import pharmacyModel from '../models/pharmacyModel.js';

dotenv.config();

const seeds = [
  {
    name: 'H-MEDIX PHARMACY LIMITED',
    address: 'Main Street, City',
    phone: '',
    email: '',
    logo: '',
    sellsDrugs: true,
    onlineOrdering: true,
    supportsDelivery: true,
    logisticAgent: 'Local Logistic Partner',
    catalogueUrl: '',
    operatingHours: 'Mon - Sat, 8:00 - 18:00',
    isActive: true,
  },
  {
    name: 'Malbo Pharmacy',
    address: '',
    phone: '',
    email: '',
    logo: '',
    sellsDrugs: true,
    onlineOrdering: true,
    supportsDelivery: true,
    logisticAgent: 'Local Logistic Partner',
    catalogueUrl: 'https://m-medix.com',
    operatingHours: 'Mon - Sat, 8:00 - 18:00',
    isActive: true,
  },
  {
    name: 'Pharmgate Pharmacy',
    address: '',
    phone: '',
    email: '',
    logo: '',
    sellsDrugs: true,
    onlineOrdering: true,
    supportsDelivery: true,
    logisticAgent: 'Local Logistic Partner',
    catalogueUrl: 'https://pharmgatepharmacy.com',
    operatingHours: 'Mon - Sat, 8:00 - 18:00',
    isActive: true,
  },
];

const seed = async () => {
  try {
    await connectDB();

    for (const entry of seeds) {
      const exists = await pharmacyModel.findOne({ name: new RegExp(entry.name.split(' ')[0], 'i') });
      if (exists) {
        console.log(`${entry.name} already exists, skipping.`);
        continue;
      }

      // Cleanse empty-string fields that may collide with unique indexes (e.g. email)
      const doc = { ...entry };
      if (doc.email === "" || doc.email === null || doc.email === undefined) {
        // set a unique placeholder email to avoid unique-null index collisions
        doc.email = `seed-${entry.name.replace(/\s+/g, '_')}-${Date.now()}@local.invalid`;
      }
      if (doc.phone === "" || doc.phone === null || doc.phone === undefined) {
        doc.phone = undefined;
      }
      if (doc.logo === "" ) delete doc.logo;

      // Always set a unique licenseNumber to avoid duplicate-null unique-index errors
      doc.licenseNumber = `seed-${entry.name.replace(/\s+/g, '_')}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      console.log('Inserting doc:', { name: doc.name, licenseNumber: doc.licenseNumber });

      await new pharmacyModel(doc).save();
      console.log(`Inserted ${entry.name}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
