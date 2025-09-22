// middleware/adminMiddleware.js
import asyncHandler from "express-async-handler";

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === "Admin" || req.user.role === "CompanyAdmin" || req.user.role === "GovAdmin")) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
});

// Use named export
export { admin };