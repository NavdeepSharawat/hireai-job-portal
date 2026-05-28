const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// =============================================
// SECURITY MIDDLEWARE
// =============================================
app.use(helmet()); // Set security HTTP headers
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts, please try again in 15 minutes." },
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging (dev only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =============================================
// API ROUTES
// =============================================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Job Portal API is running! 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// =============================================
// GLOBAL ERROR HANDLER
// =============================================
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`💊 Health: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
