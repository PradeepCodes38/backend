// seeder.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import GovJob from "./models/govJobModel.js";
import User from "./models/User.js";
import connectDB from "./config/db.js";

dotenv.config();

// --- Seed Users ---
const users = [
  {
    username: "companyadmin1",
    email: "companyadmin@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "CompanyAdmin",
  },
  {
    username: "govadmin1",
    email: "govadmin@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "GovAdmin",
  },
  {
    username: "admin1",
    email: "admin@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "Admin",
  },
  {
    username: "employee1",
    email: "employee@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "Employee",
  },
];

// --- Seed GovJobs ---
const govJobs = [
  {
    title: "Senior Software Engineer",
    company: "GovTech Solutions",
    location: "Delhi",
    salary: "₹50,000 - ₹80,000",
    experience: "3-5 years",
    fee: "₹500",
    description: "Looking for experienced software engineers to work on government projects.",
    deadline: new Date("2025-12-31"),
    status: "active",
  },
  {
    title: "Data Analyst",
    company: "Gov Data Corp",
    location: "Mumbai",
    salary: "₹40,000 - ₹60,000",
    experience: "2-3 years",
    fee: "₹400",
    description: "Analyze government data and prepare reports for policy making.",
    deadline: new Date("2025-11-30"),
    status: "active",
  },
  {
    title: "Administrative Officer",
    company: "Central Gov Services",
    location: "Kolkata",
    salary: "₹35,000 - ₹50,000",
    experience: "1-2 years",
    fee: "₹300",
    description: "Manage administrative tasks in government offices.",
    deadline: new Date("2025-12-15"),
    status: "inactive", // testing inactive status
  },
  {
    title: "Civil Engineer",
    company: "PWD",
    location: "Chennai",
    salary: "₹45,000 - ₹70,000",
    experience: "3-6 years",
    fee: "₹600",
    description: "Supervise government construction projects and ensure quality standards.",
    deadline: new Date("2026-01-15"),
    status: "draft", // testing draft status
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear old data
    await GovJob.deleteMany({});
    await User.deleteMany({});
    console.log("✅ Old GovJobs and Users deleted");

    // Insert new data
    await User.insertMany(users);
    await GovJob.insertMany(govJobs);

    console.log("🌱 GovJobs and Users seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  }
};

seedDatabase();




