const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminProtectedRoutes = require("./routes/adminProtectedRoutes");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(
  express.json({
    limit: "1mb",
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    message:
      "Too many requests. Please try again later.",
  },
});


app.use(
  "/api/auth",
  authLimiter,
  authRoutes,
);

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use(
  "/api/admin",
  adminProtectedRoutes,
);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Car Rental API is running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(
    error.statusCode || 500
  ).json({
    message:
      error.message ||
      "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`,
  );
});