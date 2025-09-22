import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Document from "../models/Document.js"; // Import the Document model
import fs from "fs";
import path from "path";

// @desc Create new employee
export const createEmployee = asyncHandler(async (req, res) => {
  const {
    referenceId, empId, name, fatherName, email, password,
    dateOfJoining, dateOfBirth, aadhar, experience, panCard,
    accountNumber, ifscCode, postedAt, designation, phoneNumber,
    department, bankName
  } = req.body;

  // Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Employee with this email already exists");
  }

  const employee = await User.create({
    referenceId,
    empId,
    name,
    fatherName,
    email,
    password, // 👈 schema pre-save hook will hash
    dateOfJoining,
    dateOfBirth,
    aadhar,
    experience,
    panCard,
    accountNumber,
    ifscCode,
    postedAt,
    designation,
    phoneNumber,
    department,
    bankName,
    role: "Employee", // force role to Employee
  });

  if (employee) {
    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid employee data");
  }
});

// @desc Get all employees
export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await User.find({ role: "Employee" }).select("-password");
  res.status(200).json(employees);
});

// @desc Get single employee
export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id).select("-password");
  
  if (!employee || employee.role !== "Employee") {
    res.status(404);
    throw new Error("Employee not found");
  }
  
  res.status(200).json(employee);
});

// @desc Update employee
export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  
  if (!employee || employee.role !== "Employee") {
    res.status(404);
    throw new Error("Employee not found");
  }
  
  const updatedEmployee = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select("-password");
  
  res.status(200).json(updatedEmployee);
});

// @desc Delete employee
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  
  if (!employee || employee.role !== "Employee") {
    res.status(404);
    throw new Error("Employee not found");
  }
  
  // Delete profile picture if it exists
  if (employee.profilePicturePath) {
    const profilePicPath = path.join(process.cwd(), employee.profilePicturePath);
    if (fs.existsSync(profilePicPath)) {
      fs.unlinkSync(profilePicPath);
    }
  }
  
  // Find and delete all documents associated with this employee
  const documents = await Document.find({ employeeId: req.params.id });
  for (const doc of documents) {
    // Delete document file from filesystem
    if (doc.filePath) {
      const docPath = path.join(process.cwd(), doc.filePath);
      if (fs.existsSync(docPath)) {
        fs.unlinkSync(docPath);
      }
    }
    // Delete document record from database
    await Document.findByIdAndDelete(doc._id);
  }
  
  // Delete the employee from the database using findByIdAndDelete instead of remove()
  await User.findByIdAndDelete(req.params.id);
  
  res.status(200).json({ message: "Employee removed" });
});

// @desc Change employee password
export const changeEmployeePassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const employee = await User.findById(req.params.id).select("+password");
  
  if (!employee || employee.role !== "Employee") {
    res.status(404);
    throw new Error("Employee not found");
  }
  
  employee.password = newPassword; // pre-save hook hashes
  await employee.save();
  
  res.status(200).json({ message: "Password updated successfully" });


});



// @desc Get current employee data
export const getCurrentEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.user._id).select("-password");
  
  if (!employee || employee.role !== "Employee") {
    res.status(404);
    throw new Error("Employee not found");
  }
  
  res.status(200).json(employee);
});