// backend/seedLabs.js
// Run this ONCE with: node seedLabs.js
// Make sure your .env file has MONGODB_URI set

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── Lab Model (inline so you can run this standalone) ────────────────────────
const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  address: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String },
  },
  phone: { type: String },
  email: { type: String },
  logo: { type: String },
  googleFormUrl: { type: String },
  operatingHours: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Lab = mongoose.models.lab || mongoose.model("lab", labSchema);

// ── Lab Test Model (inline) ───────────────────────────────────────────────────
const labTestSchema = new mongoose.Schema({
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "lab", required: true },
  testName: { type: String, required: true },
  testCode: { type: String },
  category: { type: String },
  description: { type: String },
  sampleType: { type: String },
  turnaroundTime: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LabTest = mongoose.models.labTest || mongoose.model("labTest", labTestSchema);

// ── Lab Data ──────────────────────────────────────────────────────────────────
const labsData = [
  {
    name: "Synlab Nigeria",
    slug: "syn-lab",
    description: "Leading diagnostics laboratory providing accurate and reliable medical testing services.",
    address: "Plot 1649, Cadastral Zone, Wuse II, Abuja, FCT",
    location: { lat: 9.0765, lng: 7.4983, city: "Abuja" },
    phone: "+234 800 123 4567",
    email: "nigeria@synlab.com",
    googleFormUrl: "https://forms.google.com/YOUR_SYNLAB_FORM_ID", // 🔴 REPLACE with your actual Google Form URL
    operatingHours: "Mon – Fri: 7:00am – 6:00pm | Sat: 8:00am – 2:00pm",
    isActive: true,
  },
  {
    name: "Lancet Laboratories",
    slug: "lancet-lab",
    description: "Trusted diagnostic partner offering comprehensive pathology and laboratory services.",
    address: "15 Awolowo Road, Ikoyi, Lagos / Plot 334, Gana Street, Maitama, Abuja",
    location: { lat: 9.0820, lng: 7.4891, city: "Abuja" },
    phone: "+234 800 765 4321",
    email: "info@lancet.com.ng",
    googleFormUrl: "https://forms.google.com/YOUR_LANCET_FORM_ID", // 🔴 REPLACE with your actual Google Form URL
    operatingHours: "Mon – Fri: 7:30am – 5:30pm | Sat: 8:00am – 1:00pm",
    isActive: true,
  },
];

// ── Sample Tests for Each Lab ─────────────────────────────────────────────────
const getTestsForLab = (labId, labSlug) => {
  const prefix = labSlug === "syn-lab" ? "SYN" : "LAN";
  return [
    // Haematology
    { labId, testCode: `${prefix}-001`, testName: "Full Blood Count (FBC)", category: "Haematology", sampleType: "Blood (EDTA)", turnaroundTime: "4 hours", price: 5500 },
    { labId, testCode: `${prefix}-002`, testName: "ESR (Erythrocyte Sedimentation Rate)", category: "Haematology", sampleType: "Blood (EDTA)", turnaroundTime: "4 hours", price: 3000 },
    { labId, testCode: `${prefix}-003`, testName: "Malaria Parasite Test", category: "Haematology", sampleType: "Blood", turnaroundTime: "2 hours", price: 3500 },
    { labId, testCode: `${prefix}-004`, testName: "Blood Group & Genotype", category: "Haematology", sampleType: "Blood", turnaroundTime: "3 hours", price: 4000 },

    // Biochemistry
    { labId, testCode: `${prefix}-005`, testName: "Fasting Blood Sugar (FBS)", category: "Biochemistry", sampleType: "Blood (Serum)", turnaroundTime: "4 hours", price: 3000 },
    { labId, testCode: `${prefix}-006`, testName: "HbA1c (Glycated Haemoglobin)", category: "Biochemistry", sampleType: "Blood (EDTA)", turnaroundTime: "24 hours", price: 12000 },
    { labId, testCode: `${prefix}-007`, testName: "Lipid Profile", category: "Biochemistry", sampleType: "Blood (Serum)", turnaroundTime: "24 hours", price: 10000 },
    { labId, testCode: `${prefix}-008`, testName: "Liver Function Test (LFT)", category: "Biochemistry", sampleType: "Blood (Serum)", turnaroundTime: "24 hours", price: 12000 },
    { labId, testCode: `${prefix}-009`, testName: "Kidney Function Test (KFT)", category: "Biochemistry", sampleType: "Blood (Serum)", turnaroundTime: "24 hours", price: 12000 },
    { labId, testCode: `${prefix}-010`, testName: "Uric Acid", category: "Biochemistry", sampleType: "Blood (Serum)", turnaroundTime: "4 hours", price: 4500 },

    // Microbiology
    { labId, testCode: `${prefix}-011`, testName: "Urinalysis (Full)", category: "Microbiology", sampleType: "Urine (Mid-stream)", turnaroundTime: "4 hours", price: 3500 },
    { labId, testCode: `${prefix}-012`, testName: "Urine Culture & Sensitivity", category: "Microbiology", sampleType: "Urine (Mid-stream)", turnaroundTime: "72 hours", price: 8500 },
    { labId, testCode: `${prefix}-013`, testName: "Stool Culture", category: "Microbiology", sampleType: "Stool", turnaroundTime: "72 hours", price: 7000 },
    { labId, testCode: `${prefix}-014`, testName: "H. Pylori Antigen Test", category: "Microbiology", sampleType: "Stool", turnaroundTime: "24 hours", price: 9000 },

    // Serology
    { labId, testCode: `${prefix}-015`, testName: "HIV 1 & 2 Screening", category: "Serology", sampleType: "Blood (Serum)", turnaroundTime: "4 hours", price: 5000 },
    { labId, testCode: `${prefix}-016`, testName: "Hepatitis B Surface Antigen (HBsAg)", category: "Serology", sampleType: "Blood (Serum)", turnaroundTime: "4 hours", price: 5000 },
    { labId, testCode: `${prefix}-017`, testName: "Hepatitis C Antibody (Anti-HCV)", category: "Serology", sampleType: "Blood (Serum)", turnaroundTime: "4 hours", price: 6500 },
    { labId, testCode: `${prefix}-018`, testName: "VDRL (Syphilis Screening)", category: "Serology", sampleType: "Blood (Serum)", turnaroundTime: "24 hours", price: 4000 },
    { labId, testCode: `${prefix}-019`, testName: "Widal Test (Typhoid)", category: "Serology", sampleType: "Blood (Serum)", turnaroundTime: "4 hours", price: 4500 },

    // Hormones
    { labId, testCode: `${prefix}-020`, testName: "Thyroid Function Test (TSH, T3, T4)", category: "Hormones", sampleType: "Blood (Serum)", turnaroundTime: "24 hours", price: 18000 },
    { labId, testCode: `${prefix}-021`, testName: "Prostate Specific Antigen (PSA)", category: "Hormones", sampleType: "Blood (Serum)", turnaroundTime: "24 hours", price: 12000 },
    { labId, testCode: `${prefix}-022`, testName: "Pregnancy Test (Beta-HCG)", category: "Hormones", sampleType: "Blood (Serum)", turnaroundTime: "4 hours", price: 6000 },
    { labId, testCode: `${prefix}-023`, testName: "Prolactin", category: "Hormones", sampleType: "Blood (Serum)", turnaroundTime: "24 hours", price: 9000 },
    { labId, testCode: `${prefix}-024`, testName: "Testosterone (Total)", category: "Hormones", sampleType: "Blood (Serum)", turnaroundTime: "24 hours", price: 10000 },
  ];
};

// ── Seed Function ─────────────────────────────────────────────────────────────
const seedLabs = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    for (const labData of labsData) {
      // Upsert lab (create if not exists, update if slug already there)
      const lab = await Lab.findOneAndUpdate(
        { slug: labData.slug },
        labData,
        { upsert: true, new: true }
      );
      console.log(`🏥 Lab saved: ${lab.name} (ID: ${lab._id})`);

      // Check if tests already exist for this lab
      const existingTests = await LabTest.countDocuments({ labId: lab._id });
      if (existingTests > 0) {
        console.log(`   ⚠️  Tests already exist for ${lab.name} (${existingTests} tests). Skipping test seed.`);
        console.log(`   💡 To re-seed tests, delete them from MongoDB Atlas first.\n`);
        continue;
      }

      // Seed tests
      const tests = getTestsForLab(lab._id, lab.slug);
      await LabTest.insertMany(tests);
      console.log(`   🧪 ${tests.length} tests seeded for ${lab.name}\n`);
    }

    console.log("🎉 Lab seeding complete!");
    console.log("\n⚠️  IMPORTANT: Update the googleFormUrl values in this script");
    console.log("   with your actual Google Form URLs before going live.\n");

  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

seedLabs();