import mongoose from 'mongoose';

// --- Sub-schemas for better structure ---
const educationSchema = new mongoose.Schema({
  qualification: { type: String },
  board: { type: String },
  institution: { type: String },
  marks: { type: String },
  year: { type: String }
});

const experienceSchema = new mongoose.Schema({
  company: { type: String },
  post: { type: String },
  from: { type: String },
  to: { type: String }
});

// --- Main Schema for Government Job Applications ---
const govApplicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GovJob', 
    required: true 
  },
  jobTitle: { 
    type: String, 
    required: true 
  },
  postAppliedFor: { 
    type: String, 
    required: true 
  },

  // Personal Details
  name: { type: String, required: true },
  fatherHusbandName: { type: String, required: true },
  motherName: { type: String, required: true },
  presentAddress: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },
  maritalStatus: { type: String },

  // Contact & Identity
  email: { type: String, required: true },
  mobile1: { type: String, required: true },
  mobile2: { type: String },
  panNo: { type: String },
  aadharNo: { type: String },

  // Files
  photo: { type: String, required: true }, // Path to uploaded photo

  // Application Status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'shortlisted', 'under review'],
    default: 'pending'
  },

  // Qualifications & Experience
  education: [educationSchema],
  experience: [experienceSchema],

  // Payment
  fee: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },

  // Metadata
  appliedDate: { type: Date, default: Date.now }
}, {
  timestamps: true, // createdAt & updatedAt
});

const GovApplication = mongoose.model('GovApplication', govApplicationSchema);
export default GovApplication;
