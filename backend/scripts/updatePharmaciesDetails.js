import dotenv from 'dotenv';
import connectDB from '../config/mongodb.js';
import pharmacyModel from '../models/pharmacyModel.js';

dotenv.config();

const updates = [
  {
    match: { name: /H-MEDIX/i },
    update: {
      address: 'Plot 1649, Cadastral Zone, Wuse II, Abuja, FCT',
      operatingHours: 'Mon - Sat, 8:00 - 18:00',
      logo: 'https://via.placeholder.com/150?text=H-MEDIX',
      sellsDrugs: true,
      onlineOrdering: true,
      supportsDelivery: true,
    },
  },
  {
    match: { name: /Malbo/i },
    update: {
      address: '12 Bourdillon Street, Victoria Island, Lagos',
      operatingHours: 'Mon - Sat, 8:00 - 18:00',
      logo: 'https://via.placeholder.com/150?text=Malbo',
      sellsDrugs: true,
      onlineOrdering: true,
      supportsDelivery: true,
      catalogueUrl: 'https://m-medix.com',
    },
  },
  {
    match: { name: /Pharmgate/i },
    update: {
      address: '48A Broad Street, Lagos',
      operatingHours: 'Mon - Sat, 8:00 - 18:00',
      logo: 'https://via.placeholder.com/150?text=Pharmgate',
      sellsDrugs: true,
      onlineOrdering: true,
      supportsDelivery: true,
      catalogueUrl: 'https://pharmgatepharmacy.com',
    },
  },
];

const run = async () => {
  try {
    await connectDB();
    for (const u of updates) {
      const res = await pharmacyModel.findOneAndUpdate(u.match, { $set: u.update }, { new: true });
      if (res) console.log(`Updated ${res.name}`);
      else console.log(`No match for`, u.match);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
