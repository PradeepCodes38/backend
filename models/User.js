import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    referenceId: { 
      type: String, 
      trim: true, 
      unique: true, 
      sparse: true 
    },
    empId: { type: String, trim: true },
    name: { type: String },
    fatherName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    dateOfJoining: { type: String },
    dateOfBirth: { type: String },
    aadhar: { type: String },
    experience: { type: String },
    panCard: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    postedAt: { type: String },
    designation: { type: String },
    phoneNumber: { type: String },
    department: { type: String },
    profilePicturePath: { type: String },
    role: {
      type: String,
      enum: ["CompanyAdmin", "GovAdmin", "Admin", "Employee"],
      default: "Employee",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);