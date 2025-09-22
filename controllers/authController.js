import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc Register employee (only Admins can do this)
export const registerUser = asyncHandler(async (req, res) => {
  const { 
    referenceId, empId, name, fatherName, email, password, dateOfJoining,
    dateOfBirth, aadhar, experience, panCard, accountNumber, ifscCode,
    postedAt, designation, phoneNumber, department, bankName, role 
  } = req.body;

  // Only allow admin roles to create employees
  if (!["CompanyAdmin", "GovAdmin", "Admin"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Not authorized to create users");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ 
    referenceId, empId, name, fatherName, email, password,
    dateOfJoining, dateOfBirth, aadhar, experience, panCard,
    accountNumber, ifscCode, postedAt, designation, phoneNumber,
    department, bankName, role: role || "Employee" 
  });

  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user.id, user.role),
  });
});

// @desc Login user
// @desc Login user (via Email or Reference ID)
export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be email or referenceId

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Please provide identifier and password");
  }

  // Find user by email OR referenceId
  const user = await User.findOne({
    $or: [{ email: identifier }, { referenceId: identifier }]
  }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      referenceId: user.referenceId,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});


// @desc Get current user profile
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json(user);
});

// @desc Change admin password
export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password"); // 👈 include password

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  // Update password (will be hashed by pre-save middleware)
  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});
