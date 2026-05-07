import dotenv from 'dotenv';
import connectDB from '../config/mongodb.js';
import pharmacyModel from '../models/pharmacyModel.js';

dotenv.config();

const list = async () => {
  await connectDB();
  const docs = await pharmacyModel.find().lean();
  console.log('Found', docs.length);
  docs.forEach(d => console.log(d.name, '->', d.licenseNumber));
  process.exit(0);
};

list();
